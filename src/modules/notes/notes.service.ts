import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { CreateNoteDto } from './dto/create-note.dto'
import {
	calculateReadTimeMinutes,
	compareNotesWithCombinedFeatures,
	createEmptyRatings,
	extractBodyFromFile
} from './helper'
import { NotesRepository } from './notes.repository'
import { Note } from './models/notes.model'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { existsSync } from 'fs'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'
import { ClassroomService } from '../class/classroom.service'

const config: IConfigAttributes = getConfig()

@Injectable()
export class NotesService {
	constructor(
		private readonly notesRepository: NotesRepository,
		private readonly filesService: FilesService,
		private readonly elasticsearchService: ElasticsearchService,
		@Inject(forwardRef(() => ClassroomService))
		private readonly classroomService: ClassroomService
	) {}

	async getNoteWithID(id: number, userId: number, classId?: string): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id, classId) // Will filter by classId if passed in with function call

		// Make sure note actually exists
		if (!note) {
			throw new NotFoundException(`Could not find a note with id, ${id}`)
		}

		// Verify classroom membership
		const userInClass = await this.classroomService.userInClass(note.classId, userId)
		if (!userInClass) {
			throw new ForbiddenException(
				`Cannot get note details for note that is part of class with ID ${note.classId} since you are not a member ...`
			)
		}

		return note
	}

	async getNotesUsingES(userId: number, searchType: string, searchQuery: object, classId: string): Promise<Note[]> {
		// Verify classroom membership
		const userInClass = await this.classroomService.userInClass(classId, userId)
		if (!userInClass) {
			throw new ForbiddenException(`You do cannot search notes inside a classroom you are not a part of ...`)
		}

		// Set up search parameters and search
		const results: Note[] = []
		const hits = await this.elasticsearchService.searchNotesForQuery(searchType, searchQuery)

		// For each hit get full note with ID and append to result
		for (const hit of hits) {
			const note: Note = await this.notesRepository.findNoteById(hit['_source']['id'], classId)

			// If a note was found in the database too then append to the results
			if (note) {
				results.push(note)
			}
		}

		if (!results || results.length === 0) {
			throw new NotFoundException(
				'Failed to get data from database for related hits... It is possible the data has been removed.'
			)
		}

		return results.sort(compareNotesWithCombinedFeatures)
	}

	async updateNoteWithID(authorId: number, id: number, data: object): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (authorId !== note.authorId) {
			throw new ForbiddenException('You cannot edit this note as you are not the author')
		}

		// Filter out unallowed fields
		const allowedFields = [
			'title',
			'keywords',
			'body',
			'shortDescription',
			'rating',
			'classId',
			'authorId',
			'timeLength',
			'bibtextCitation'
		]

		const filteredData: object = Object.keys(data)
			.filter((key) => allowedFields.includes(key))
			.reduce((obj, key) => {
				obj[key] = data[key]
				return obj
			}, {})

		return this.notesRepository.updateNote(note, filteredData)
	}

	async deleteNoteWithID(authorId: number, id: number, fileUri?: string): Promise<boolean> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (authorId !== note.authorId) {
			throw new ForbiddenException('You are not allowed to delete this note as you are not its author')
		}

		// Remove the note from the elasticsearch index
		await this.elasticsearchService.deleteNoteWithIDFromES(id)

		// Delete the actual file for the note
		const fileDelSuccess = await this.filesService.deleteFileWithID(fileUri ? fileUri : note.fileUri)

		if (!fileDelSuccess) {
			throw new InternalServerErrorException(
				'For some reason, we could not delete the file associated with this note. Aborting delete operation.'
			)
		}

		// Delete the actual note from the database now
		return this.notesRepository.deleteNote(note)
	}

	async createNoteWithFile(data: CreateNoteDto, authorId: number): Promise<Note> {
		const fileStat = existsSync(`${config.fileStorageLocation}/${data.fileUri}`)
		const userInClass = await this.classroomService.userInClass(data.classId, authorId)

		if (!fileStat) {
			throw new NotFoundException(
				'Could not find a file with that URI. If you have not done so already, ensure you upload a file by issuing POST request to /files'
			)
		}

		if (!userInClass) {
			// Delete the uploaded file
			const res = await this.filesService.deleteFileWithID(data.fileUri)

			if (!res) {
				throw new InternalServerErrorException(
					`Failed to delete file after encountering create error for file with URI ${data.fileUri}`
				)
			}

			// Throw appropriate exception now
			throw new ForbiddenException(
				`Cannot create not in a class (${data.classId}) you (${authorId}) are not a part of.`
			)
		}

		// Perform some preprocessing before note creation
		const body = await extractBodyFromFile(data.fileUri)
		const readTime = await calculateReadTimeMinutes(body)
		const ratings = createEmptyRatings()

		// Create the note in the database
		try {
			const res = await this.notesRepository.createNote(
				data.title,
				authorId,
				data.classId,
				data.keywords,
				data.fileUri,
				body,
				data.shortDescription,
				ratings,
				readTime,
				data.bibtextCitation
			)

			return res
		} catch (err) {
			// Delete the uploaded file
			const res = await this.filesService.deleteFileWithID(data.fileUri)

			if (!res) {
				throw new InternalServerErrorException(
					`Failed to delete file after encountering create error for file with URI ${data.fileUri}`
				)
			}

			// Finally throw the appropriate exception
			throw new InternalServerErrorException(`Failed to create note. Reason: ${err.message}`)
		}
	}
}

import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { CreateNoteDto } from './dto/create-note.dto'
import { calculateReadTimeMinutes, compareNotesWithCombinedFeatures, createNoteAbstract } from './helper'
import { NotesRepository } from './notes.repository'
import { Note } from './models/notes.model'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'
import { ClassroomService } from '../class/classroom.service'
import { RatingsService } from '../ratings/ratings.service'
import { Rating } from '../ratings/models/rating.model'

const config: IConfigAttributes = getConfig()

@Injectable()
export class NotesService {
	constructor(
		private readonly notesRepository: NotesRepository,
		private readonly filesService: FilesService,
		private readonly elasticsearchService: ElasticsearchService,
		private readonly ratingsService: RatingsService,
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

	async addOrUpdateRating(noteId: number, userId: number, value: number): Promise<Note> {
		const note: Note = await this.getNoteWithID(noteId, userId)
		const ratings: Rating[] = note.ratings.filter((r) => r.userId === userId)

		if (ratings.length === 0) {
			// This user has no existing rating
			await this.ratingsService.addRating(value, userId, noteId)
			return note
		}

		await this.ratingsService.updateRating(ratings[0].id, value)
		return note
	}

	async getAverageRating(noteId: number, userId: number): Promise<number> {
		const note: Note = await this.getNoteWithID(noteId, userId)

		// Get all the rating values
		let totalRating = 0
		for (const r of note.ratings) {
			totalRating += r.value
		}

		return Math.floor(totalRating / note.ratings.length === 0 ? 1 : note.ratings.length)
	}

	async updateNoteWithID(
		userId: number,
		id: number,
		data: { title?: string; keywords?: string[]; noteAbstract?: string; rating?: number[]; fileUri?: string }
	): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (userId !== note.authorId) {
			throw new ForbiddenException('You cannot edit this note as you are not the author')
		}

		if (data.fileUri) {
			await this.filesService.deleteFileWithID(note.fileUri)
		}

		return this.notesRepository.updateNote(note, data)
	}

	async deleteNoteWithID(userId: number, id: number): Promise<boolean> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (userId !== note.authorId) {
			throw new ForbiddenException('You are not allowed to delete this note as you are not its author')
		}

		// Remove the note from the elasticsearch index
		await this.elasticsearchService.deleteNoteWithIDFromES(id)
		await this.filesService.deleteFileWithID(note.fileUri)

		// Delete the database entry now
		return this.notesRepository.deleteNote(note)
	}

	async createNoteWithFile(data: CreateNoteDto, authorId: number): Promise<Note> {
		const userInClass = await this.classroomService.userInClass(data.classId, authorId)

		// Ensure Note File Exists
		const fileExists = await this.filesService.remoteFileExists(data.fileUri)
		if (!fileExists) {
			throw new NotFoundException(`File with URI of ${data.fileUri} does not exist. Try uploading again`)
		}

		// Ensure Note File is valid Format
		const fileValid = await this.filesService.isValidFileType(data.fileUri)
		if (!fileValid) {
			throw new BadRequestException(`Invalid note file type provided`)
		}

		if (!userInClass) {
			// Delete the uploaded file (if exists)
			await this.filesService.deleteFileWithID(data.fileUri)

			// Throw appropriate exception now
			throw new ForbiddenException(
				`Cannot create not in a class (${data.classId}) you (${authorId}) are not a part of.`
			)
		}

		// Perform some preprocessing before note creation
		const body = await this.filesService.extractBodyFromPDF(data.fileUri)
		const readTime = await calculateReadTimeMinutes(body)
		const abstract = await createNoteAbstract(body)
		const noteCDN = `https://${config.noteDataSpace}.${config.spacesEndpoint}/${data.fileUri}`

		// Create the note in the database
		try {
			const res = await this.notesRepository.createNote(
				data.title,
				authorId,
				data.classId,
				data.keywords,
				data.fileUri,
				noteCDN,
				abstract,
				data.shortDescription,
				readTime,
				data.bibtextCitation
			)

			return res
		} catch (err) {
			// Delete the uploaded file (if exists)
			await this.filesService.deleteFileWithID(data.fileUri)

			// Finally throw the appropriate exception
			throw new InternalServerErrorException(`Failed to create note. Reason: ${err.message}`)
		}
	}
}

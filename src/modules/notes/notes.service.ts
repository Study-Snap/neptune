import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CreateNoteDto } from './dto/create-note.dto'
import { calculateReadTimeMinutes, createEmptyRatings, extractBodyFromFile } from './helper'
import { NotesRepository } from './notes.repository'
import { Note } from './models/notes.model'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { existsSync } from 'fs'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'

const config: IConfigAttributes = getConfig()

@Injectable()
export class NotesService {
	constructor(
		private readonly notesRepository: NotesRepository,
		private readonly filesService: FilesService,
		private readonly elasticsearchService: ElasticsearchService
	) {}

	async getAllNotes(): Promise<Note[]> {
		const notes: Note[] = await this.notesRepository.findAllNotes()

		if (!notes || notes.length === 0) {
			throw new NotFoundException('Did not find any notes in the database')
		}

		return notes
	}

	async getNoteWithId(id: number): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find a note with id, ${id}`)
		}

		return note
	}

	async getNotesUsingES(searchType: string, searchQuery: object): Promise<Note[]> {
		const results: Note[] = []
		const hits = await this.elasticsearchService.searchNotesForQuery(searchType, searchQuery)

		// For each hit get full note with ID and append to result
		for (const hit of hits) {
			const note: Note = await this.getNoteWithId(hit['_source']['id'])

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

		return results
	}

	async getNotesWithTitle(title: string): Promise<Note[]> {
		const notes: Note[] = await this.notesRepository.findNotesMatchesTitle(title)

		if (!notes) {
			throw new NotFoundException(`Could not find any notes containing the title: ${title}`)
		}

		return notes
	}

	async updateNoteWithId(authorId: number, id: number, data: object): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (authorId !== note.authorId) {
			throw new UnauthorizedException('You cannot edit this note as you are not the author')
		}

		// Filter out unallowed fields
		const allowedFields = [
			'title',
			'keywords',
			'body',
			'shortDescription',
			'isPublic',
			'allowDownloads',
			'rating',
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

	async deleteNoteWithId(authorId: number, id: number, fileUri?: string): Promise<boolean> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (authorId !== note.authorId) {
			throw new UnauthorizedException('You are not allowed to delete this note as you are not its author')
		}

		// Remove the note from the elasticsearch index
		await this.elasticsearchService.deleteNoteWithIdFromES(id)

		// Delete the actual file for the note
		const fileDelSuccess = await this.filesService.deleteFileWithId(fileUri ? fileUri : note.fileUri)

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

		if (!fileStat) {
			throw new NotFoundException(
				'Could not find a file with that URI. If you have not done so already, ensure you upload a file by issuing POST request to /neptune/files'
			)
		}

		// Perform some preprocessing before note creation
		const body = await extractBodyFromFile(data.fileUri)
		const readTime = await calculateReadTimeMinutes(body)
		const ratings = createEmptyRatings()

		// Create the note in the database
		return this.notesRepository.createNote(
			data.title,
			authorId,
			data.keywords,
			data.fileUri,
			body,
			data.shortDescription,
			data.isPublic,
			data.allowDownloads,
			ratings,
			readTime,
			data.bibtextCitation
		)
	}
}

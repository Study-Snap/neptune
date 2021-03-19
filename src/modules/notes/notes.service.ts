import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CreateNoteDto } from './dto/create-note.dto'
import { calculateReadTimeMinutes, createEmptyRatings, extractBodyFromFile } from './helper'
import { NotesRepository } from './notes.repository'
import { Note } from './models/notes.model'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from 'src/config'
import { existsSync } from 'fs'

const config: IConfigAttributes = getConfig()

@Injectable()
export class NotesService {
	constructor(private readonly notesRepository: NotesRepository) {}

	async getNoteWithId(id: number): Promise<Note> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find a note with id, ${id}`)
		}

		return note
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
			'downloadAvailable',
			'rating',
			'timeLength',
			'bibtextCitation'
		]

		const filteredData: object = Object.keys(data).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
			obj[key] = data[key]
			return obj
		}, {})

		return this.notesRepository.updateNote(note, filteredData)
	}

	async deleteNoteWithId(authorId: number, id: number): Promise<boolean> {
		const note: Note = await this.notesRepository.findNoteById(id)

		if (!note) {
			throw new NotFoundException(`Could not find note with ID, ${id}`)
		}

		if (authorId !== note.authorId) {
			throw new UnauthorizedException('You are not allowed to delete this note as you are not its author')
		}

		return this.notesRepository.deleteNote(note)
	}

	async createNoteWithFile(data: CreateNoteDto, authorId: number, ratingsSize?: number): Promise<Note> {
		const noteFile = `${data.fileId}.${data.fileType}`
		const fileStat = existsSync(`${config.fileStorageLocation}/${noteFile}`)

		if (!fileStat) {
			throw new NotFoundException('Could not find a file with that ID')
		}

		// Perform some preprocessing before note creation
		const body = await extractBodyFromFile(noteFile)
		const readTime = await calculateReadTimeMinutes(body)
		const ratings = createEmptyRatings(ratingsSize)

		// Create the note in the database
		return this.notesRepository.createNote(
			data.title,
			authorId,
			data.keywords,
			data.fileId,
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

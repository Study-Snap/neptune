import { Injectable, NotFoundException } from '@nestjs/common'
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

	async createNoteWithFile(data: CreateNoteDto, authorId: number, ratingsSize?: number): Promise<Note> {
		const noteFile = `${data.fileId}.${data.fileType}`
		const fileStat = existsSync(`${config.fileStorageLocation}/${noteFile}`)

		if (!fileStat) {
			throw new NotFoundException('Could not find a file with that ID')
		}

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

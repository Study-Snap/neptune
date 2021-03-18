import { Injectable, NotFoundException } from '@nestjs/common'
import { IFileWithId } from 'src/common/interfaces/common'
import { CreateNoteDto } from './dto/create-note.dto'
import { calculateReadTimeMinutes, extractBodyFromFile } from './helper'
import { NotesRepository } from './notes.repository'
import { Note } from './models/notes.model'

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

	async createNoteWithFile(
		data: CreateNoteDto,
		file: IFileWithId,
		authorId: number,
		ratingsSize?: number
	): Promise<Note> {
		const body = await extractBodyFromFile(file.data)
		const readTime = await calculateReadTimeMinutes(body)

		let ratings = []
		if (ratingsSize) {
			ratings = [
				...Array(ratingsSize).keys()
			]
		}

		// Create the note in the database
		return this.notesRepository.createNote(
			data.title,
			authorId,
			data.keywords,
			file.id,
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

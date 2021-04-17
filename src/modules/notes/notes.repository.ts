import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { Note } from './models/notes.model'

@Injectable()
export class NotesRepository {
	constructor(@InjectModel(Note) private noteModel: typeof Note) {}

	async findAllNotes(): Promise<Note[] | undefined> {
		return this.noteModel.findAll()
	}

	async findNoteById(id: number): Promise<Note | undefined> {
		return this.noteModel.findOne({
			where: {
				id: id
			}
		})
	}

	async findNotesMatchesTitle(title: string): Promise<Note[] | undefined> {
		return this.noteModel.findAll({
			where: {
				title: {
					[Op.like]: `%${title}%`
				}
			}
		})
	}

	async createNote(
		title: string,
		authorId: number,
		keywords: string[],
		fileUri: string,
		body: string,
		shortDescription: string,
		isPublic: boolean,
		allowDownloads: boolean,
		rating?: number[],
		timeLength?: number,
		bibtextCitation?: string
	): Promise<Note | undefined> {
		return this.noteModel.create(
			{
				title,
				authorId,
				keywords,
				fileUri,
				body,
				shortDescription,
				rating,
				timeLength,
				bibtextCitation,
				isPublic,
				allowDownloads
			},
			{ validate: false }
		)
	}

	async updateNote(note: Note, data: object): Promise<Note | undefined> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('Invalid update fields specified in update request')
		}

		return note.update(data)
	}

	async deleteNote(note: Note): Promise<boolean> {
		await note.destroy()
		return true
	}
}

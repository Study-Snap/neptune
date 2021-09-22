import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { DB_CONNECTION_NAME } from '../../common/constants'
import { Note } from './models/notes.model'

@Injectable()
export class NotesRepository {
	constructor(
		@InjectModel(Note, DB_CONNECTION_NAME)
		private noteModel: typeof Note
	) {}

	async findAllNotes(): Promise<Note[] | undefined> {
		return this.noteModel.findAll()
	}

	async findNoteById(id: number, classId?: string): Promise<Note | undefined> {
		return classId
			? this.noteModel.findOne({
					where: {
						id,
						classId
					}
				})
			: this.noteModel.findOne({
					where: {
						id
					}
				})
	}

	/** !!MAYBE: LEGACY!! */
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
		classId: string,
		keywords: string[],
		fileUri: string,
		body: string,
		shortDescription: string,
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
				classId
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

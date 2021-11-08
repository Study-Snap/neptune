import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { User } from '../class/models/user.model'
import { Rating } from '../ratings/models/rating.model'
import { Note } from './models/notes.model'

@Injectable()
export class NotesRepository {
	constructor(
		@InjectModel(Note, DB_CONNECTION_NAME)
		private noteModel: typeof Note
	) {}

	async findAllNotes(classId: string): Promise<Note[] | undefined> {
		return this.noteModel.findAll({
			where: {
				classId
			},
			include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ]
		})
	}

	async findNoteById(id: number, classId?: string): Promise<Note | undefined> {
		return classId
			? this.noteModel.findOne({
					where: {
						id,
						classId
					},
					include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ]
				})
			: this.noteModel.findOne({
					where: {
						id
					},
					include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ]
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

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Note } from './models/notes.model'

@Injectable()
export class NotesRepository {
	constructor(@InjectModel(Note) private noteModel: typeof Note) {}

	async findNoteById(id: number): Promise<Note | undefined> {
		return this.noteModel.findOne({
			where: {
				id: id
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
		downloadAvailable: boolean,
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
				downloadAvailable
			},
			{ validate: true }
		)
	}
}

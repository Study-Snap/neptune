import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { User } from '../class/models/user.model'
import { Rating } from '../ratings/models/rating.model'
import { Note } from './models/notes.model'

/**
 * Interface between note database tables and the note service functions
 */
@Injectable()
export class NotesRepository {
	constructor(
		@InjectModel(Note, DB_CONNECTION_NAME)
		private noteModel: typeof Note
	) {}

	/**
	 * Responses with a full set of notes in the specified classroom provided by classID
	 * @param classId Unique ID for the classroom
	 * @returns A list of all notes stored in the specified classroom
	 */
	async findAllNotes(classId: string): Promise<Note[] | undefined> {
		return this.noteModel.findAll({
			where: {
				classId
			},
			include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ]
		})
	}

	/**
	 * Gets note details using the notes unique ID. This will limit the search to those notes inside a classroom if a classId (`optional`) is provided
	 * @param id Unique ID for the note
	 * @param classId Unique ID for a classroom `(optional)`
	 * @returns A note object with a given ID
	 */
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

	/**
	 * Creates (inserts) a note in the database
	 * @param title Title of the note
	 * @param authorId Author (user ID) of the requester who is looking to create the note
	 * @param classId Class ID where the note will be located (association)
	 * @param keywords A list of keywords that will help to identify the note
	 * @param fileUri A URI that points to the uploaded note file in the cloud S3 object storage
	 * @param noteCDN A URL that directly points to the note file through the provided CDN
	 * @param noteAbstract A short pullout of note data from the uploaded file that describes what 
	 * the note will be about or at least the start of then note which usually contains information about the purpose or backgroun for the note material
	 * @param shortDescription A short `USER PROVIDED` description that describes what the note is about
	 * @param timeLength An automatically generated `time-to-read` value that tells the user how long this note might take to read given its size in the description + note file contents
	 * @param bibtextCitation A formatted bibtex citation that can be used to generate multiple citation formats from a single string format
	 * @returns The created note object
	 */
	async createNote(
		title: string,
		authorId: number,
		classId: string,
		keywords: string[],
		fileUri: string,
		noteCDN: string,
		noteAbstract: string,
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
				noteCDN,
				shortDescription,
				noteAbstract,
				timeLength,
				bibtextCitation,
				classId
			},
			{ validate: false }
		)
	}

	/**
	 * Updates a note in the database provided a valid set of key-value pairs which can be changed
	 * @param note The note object to be updated
	 * @param data The new data to update (key-value pairs) on the note object
	 * @returns The updated note object
	 */
	async updateNote(note: Note, data: object): Promise<Note | undefined> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('Invalid update fields specified in update request')
		}

		return note.update(data)
	}

	/**
	 * Deletes (drops) a note form the database
	 * @param note The note object to delete
	 * @returns True iff the deletion was successful
	 */
	async deleteNote(note: Note): Promise<boolean> {
		await note.destroy()
		return true
	}
}

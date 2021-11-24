import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { Note } from '../notes/models/notes.model'
import { Rating } from '../ratings/models/rating.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'

/**
 * User data repository interface
 */
@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User, DB_CONNECTION_NAME)
		private userModel: typeof User
	) {}

	/**
	 * Gets a user from the database
	 * @param id Users unique ID
	 * @returns A user object containing details (minus password field) for the selected user
	 */
	async get(id: number): Promise<User> {
		return this.userModel.findOne({
			where: {
				id
			},
			attributes: {
				exclude: [ DB_USERS_PASSWORD_FIELD ]
			}
		})
	}

	/**
	 * Gets a list of classrooms that the provided user is a part of
	 * @param id Unique User ID
	 * @returns A list of classrooms the user is a part of
	 */
	async getClassrooms(id: number): Promise<Classroom[] | undefined> {
		return (await this.userModel.findOne({ where: { id }, include: [ Classroom ] })).classes
	}

	/**
	 * Gets all notes the user has uploaded
	 * @param id User's Unique ID
	 * @returns All notes the user uploaded regardless of class membership
	 */
	async getNotes(id: number): Promise<Note[] | undefined> {
		return (await this.userModel.findOne({
			where: { id },
			include: [
				{ model: Note, include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ] }
			]
		})).notes
	}
}

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { Note } from '../notes/models/notes.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User, DB_CONNECTION_NAME)
		private userModel: typeof User
	) {}

	/** READ-ONLY FROM NEPTUNE **/
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

	async getClassrooms(id: number): Promise<Classroom[] | undefined> {
		return (await this.userModel.findOne({ where: { id }, include: [ Classroom ] })).classes
	}

	async getNotes(id: number): Promise<Note[] | undefined> {
		return (await this.userModel.findOne({ where: { id }, include: [ Note ] })).notes
	}
}

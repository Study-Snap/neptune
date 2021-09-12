import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from 'src/common/constants'
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

	async getClassrooms(id: number): Promise<Classroom[]> {
		return (await this.userModel.findOne({ where: { id: id }, include: [ Classroom ] })).classes
	}
}

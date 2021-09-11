import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User, DB_CONNECTION_NAME)
		private userModel: typeof User,
		@InjectModel(Classroom, DB_CONNECTION_NAME)
		private crModel: typeof Classroom
	) {}

	/** READ-ONLY FROM NEPTUNE **/
	async get(id: number): Promise<User> {
		return this.userModel.findOne({
			where: {
				id
			}
		})
	}
}

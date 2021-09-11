import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
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
			}
		})
	}
}

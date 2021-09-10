import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CLASS_DB_CONNECTION } from 'src/common/constants'
import { User } from './models/user.model'

@Injectable()
export class UserRepository {
	constructor(
		@InjectModel(User, CLASS_DB_CONNECTION)
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

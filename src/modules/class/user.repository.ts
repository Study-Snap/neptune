import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User } from './models/user.model'

@Injectable()
export class UserRepository {
	constructor(@InjectModel(User) private userModel: typeof User) {}
}

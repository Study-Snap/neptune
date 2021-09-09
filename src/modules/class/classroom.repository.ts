import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Model } from 'sequelize-typescript'
import { CLASS_DB_CONNECTION } from 'src/common/constants'
import { Classroom } from './models/classroom.model'

@Injectable()
export class ClassroomRepository {
	constructor(
		@InjectModel(Classroom, CLASS_DB_CONNECTION)
		private crModel: typeof Model
	) {}
}

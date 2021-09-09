import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Classroom } from './models/classroom.model'

@Injectable()
export class ClassroomRepository {
	constructor(@InjectModel(Classroom) private crModel: typeof Classroom) {}
}

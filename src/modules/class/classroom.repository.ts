import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
import { Classroom } from './models/classroom.model'
import { ClassroomUser } from './models/classroom-user.model'
import { v4 as uuid } from 'uuid'
import { User } from './models/user.model'

@Injectable()
export class ClassroomRepository {
	constructor(
		@InjectModel(Classroom, DB_CONNECTION_NAME)
		private crModel: typeof Classroom,
		@InjectModel(ClassroomUser, DB_CONNECTION_NAME)
		private cuModel: typeof ClassroomUser
	) {}

	async insert(name: string, ownerId: number): Promise<Classroom | undefined> {
		const id: string = uuid()
		return this.crModel.create(
			{
				id,
				name,
				ownerId
			},
			{ validate: true }
		)
	}

	async get(id: string): Promise<Classroom | undefined> {
		return this.crModel.findOne({
			where: {
				id
			}
		})
	}

	async update(cr: Classroom, data: object): Promise<Classroom | undefined> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException(`Invalid length for update fields specified in update request`)
		}

		return cr.update(data)
	}

	async delete(cr: Classroom): Promise<boolean> {
		await cr.destroy()
		return true
	}

	async join(cr: Classroom, user: User): Promise<ClassroomUser> {
		return this.cuModel.create({
			classId: cr.id,
			userId: user.id
		})
	}

	async leave(cr: Classroom, user: User): Promise<boolean> {
		const cu: ClassroomUser = await this.cuModel.findOne({ where: { classId: cr.id, userId: user.id } })

		if (!cu) {
			throw new NotFoundException(`Could not find ${user.firstName} ${user.lastName} in ${cr.name} ... `)
		}

		// delete the relationship (ie: user leaves classroom)
		await cu.destroy()
		return true
	}
}

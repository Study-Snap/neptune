import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Classroom } from './classroom.model'
import { User } from './user.model'

@Table
export class ClassroomUser extends Model {
	@ForeignKey(() => Classroom)
	@Column
	classId: string

	@ForeignKey(() => User)
	@Column
	userId: number
}

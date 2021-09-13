import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Classroom } from './classroom.model'
import { User } from './user.model'

@Table({ tableName: 'classrooms_users', underscored: true })
export class ClassroomUser extends Model<ClassroomUser> {
	@ForeignKey(() => Classroom)
	@Column
	classId: string

	@ForeignKey(() => User)
	@Column
	userId: number
}

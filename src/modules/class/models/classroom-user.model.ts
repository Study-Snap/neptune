import { ApiProperty } from '@nestjs/swagger'
import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Classroom } from './classroom.model'
import { User } from './user.model'

@Table({ tableName: 'classrooms_users', underscored: true })
export class ClassroomUser extends Model<ClassroomUser> {
	@ApiProperty()
	@ForeignKey(() => Classroom)
	@Column
	classId: string

	@ApiProperty({ type: Number })
	@ForeignKey(() => User)
	@Column
	userId: number
}

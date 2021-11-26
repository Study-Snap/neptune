import { ApiProperty } from '@nestjs/swagger'
import { Column, ForeignKey, Model, Table } from 'sequelize-typescript'
import { Classroom } from './classroom.model'
import { User } from './user.model'

/**
 * The classroomuser join table model that describes the intermediate table that allows us to 
 * perform the many-to-many relationship between classrooms and users
 */
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

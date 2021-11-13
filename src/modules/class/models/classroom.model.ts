import { ApiProperty } from '@nestjs/swagger'
import { AllowNull, Column, DataType, PrimaryKey, Table, Model, BelongsToMany, HasMany } from 'sequelize-typescript'
import { Note } from '../../../modules/notes/models/notes.model'
import { ClassroomUser } from './classroom-user.model'
import { User } from './user.model'

@Table({ tableName: 'classrooms', underscored: true })
export class Classroom extends Model<Classroom> {
	@ApiProperty()
	@PrimaryKey
	@Column(DataType.STRING)
	id: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.STRING)
	name: string

	@ApiProperty({ type: Number })
	@AllowNull(false)
	@Column(DataType.INTEGER)
	ownerId: number

	@ApiProperty()
	@Column(DataType.STRING)
	thumbnailUri: string

	/** Entity Relationships */

	@HasMany(() => Note)
	notes: Note[]

	@BelongsToMany(() => User, () => ClassroomUser)
	users: User[]

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

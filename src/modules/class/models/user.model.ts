import { ApiProperty } from '@nestjs/swagger'
import {
	AllowNull,
	AutoIncrement,
	Column,
	DataType,
	IsEmail,
	PrimaryKey,
	Table,
	Unique,
	Model,
	BelongsToMany,
	HasMany
} from 'sequelize-typescript'
import { Note } from '../../../modules/notes/models/notes.model'
import { ClassroomUser } from './classroom-user.model'
import { Classroom } from './classroom.model'

/**
 * The model that describes attributes and relationships for a User
 */
// !! DO NOT TOUCH !! //
@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
	@ApiProperty({ type: Number })
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id: number

	@ApiProperty()
	@Unique
	@IsEmail
	@AllowNull(false)
	@Column(DataType.STRING)
	email: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.STRING)
	password: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.STRING)
	firstName: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.STRING)
	lastName: string

	/** Entity Relationships */
	@BelongsToMany(() => Classroom, () => ClassroomUser)
	classes: Classroom[]

	@HasMany(() => Note, { onDelete: 'cascade', hooks: true })
	notes: Note[]

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

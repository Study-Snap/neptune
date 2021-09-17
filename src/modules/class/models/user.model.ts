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

// !! DO NOT TOUCH !! //
@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id: number

	@Unique
	@IsEmail
	@AllowNull(false)
	@Column(DataType.STRING)
	email: string

	@AllowNull(false)
	@Column(DataType.STRING)
	password: string

	@AllowNull(false)
	@Column(DataType.STRING)
	firstName: string

	@AllowNull(false)
	@Column(DataType.STRING)
	lastName: string

	/** Entity Relationships */
	@BelongsToMany(() => Classroom, () => ClassroomUser)
	classes: Classroom[]

	@HasMany(() => Note)
	notes: Note[]

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

import { AllowNull, Column, DataType, PrimaryKey, Table, Model, BelongsToMany, HasMany } from 'sequelize-typescript'
import { Note } from '../../../modules/notes/models/notes.model'
import { ClassroomUser } from './classroom-user.model'
import { User } from './user.model'

@Table({ tableName: 'classrooms', underscored: true })
export class Classroom extends Model<Classroom> {
	@PrimaryKey
	@Column(DataType.STRING)
	id: string

	@AllowNull(false)
	@Column(DataType.STRING)
	name: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	ownerId: number

	/** Entity Relationships */

	@HasMany(() => Note)
	notes: Note[]

	@BelongsToMany(() => User, () => ClassroomUser)
	users: User[]

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

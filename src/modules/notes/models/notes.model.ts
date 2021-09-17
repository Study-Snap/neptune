import {
	AllowNull,
	Model,
	AutoIncrement,
	Column,
	DataType,
	PrimaryKey,
	Table,
	Unique,
	ForeignKey,
	BelongsTo
} from 'sequelize-typescript'
import { User } from '../../../modules/class/models/user.model'
import { Classroom } from '../../../modules/class/models/classroom.model'

@Table({ tableName: 'notes', underscored: true })
export class Note extends Model<Note> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id: number

	@AllowNull(true)
	@Column(DataType.ARRAY(DataType.INTEGER))
	rating: number[]

	@AllowNull(true)
	@Column(DataType.INTEGER)
	timeLength: number

	@AllowNull(true)
	@Column(DataType.TEXT)
	bibtextCitation: string

	@AllowNull(false)
	@Column(DataType.TEXT)
	title: string

	@AllowNull(false)
	@Column(DataType.ARRAY(DataType.TEXT))
	keywords: string[]

	@AllowNull(true)
	@Column(DataType.TEXT)
	shortDescription: string

	@AllowNull(true)
	@Column(DataType.TEXT)
	body: string

	@Unique
	@AllowNull(true)
	@Column(DataType.STRING)
	fileUri: string

	/** Entity Relationships */

	@ForeignKey(() => Classroom)
	@Column
	classId: string

	@BelongsTo(() => Classroom)
	class: Classroom

	@ForeignKey(() => User)
	@Column
	authorId: number

	@BelongsTo(() => User)
	user: User

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

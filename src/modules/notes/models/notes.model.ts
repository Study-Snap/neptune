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
	BelongsTo,
	HasMany
} from 'sequelize-typescript'
import { User } from '../../../modules/class/models/user.model'
import { Classroom } from '../../../modules/class/models/classroom.model'
import { ApiProperty } from '@nestjs/swagger'
import { Rating } from '../../../modules/ratings/models/rating.model'

@Table({ tableName: 'notes', underscored: true })
export class Note extends Model<Note> {
	@ApiProperty()
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id: number

	@ApiProperty()
	@AllowNull(true)
	@Column(DataType.INTEGER)
	timeLength: number

	@ApiProperty()
	@AllowNull(true)
	@Column(DataType.TEXT)
	bibtextCitation: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.TEXT)
	title: string

	@ApiProperty()
	@AllowNull(false)
	@Column(DataType.ARRAY(DataType.TEXT))
	keywords: string[]

	@ApiProperty()
	@AllowNull(true)
	@Column(DataType.TEXT)
	shortDescription: string

	@ApiProperty()
	@AllowNull(true)
	@Column(DataType.TEXT)
	noteAbstract: string

	@ApiProperty()
	@Unique
	@AllowNull(false)
	@Column(DataType.STRING)
	fileUri: string

	@ApiProperty()
	@Unique
	@AllowNull(false)
	@Column(DataType.STRING)
	noteCDN: string

	/** Entity Relationships */

	@ApiProperty({ description: 'The classroom for which this note belongs' })
	@ForeignKey(() => Classroom)
	@Column
	classId: string

	@BelongsTo(() => Classroom, { onDelete: 'cascade' })
	class: Classroom

	@ApiProperty({ description: 'The author of this note' })
	@ForeignKey(() => User)
	@Column
	authorId: number

	@BelongsTo(() => User)
	user: User

	@ApiProperty({ description: 'A list of ratings made by users for this note' })
	@HasMany(() => Rating, { onDelete: 'cascade', hooks: true })
	ratings: Rating[]

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

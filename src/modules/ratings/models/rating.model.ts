import { ApiProperty } from '@nestjs/swagger'
import {
	Table,
	Model,
	PrimaryKey,
	AutoIncrement,
	Column,
	DataType,
	AllowNull,
	ForeignKey,
	BelongsTo,
	Min,
	Max
} from 'sequelize-typescript'
import { User } from '../../class/models/user.model'
import { Note } from '../../notes/models/notes.model'

@Table({ tableName: 'ratings', underscored: true })
export class Rating extends Model<Rating> {
	@ApiProperty()
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id: number

	@ApiProperty({ minimum: 1, maximum: 5, description: 'Rating for the note' })
	@AllowNull(false)
	@Min(1)
	@Max(5)
	@Column(DataType.INTEGER)
	value: number

	/** Entity Relationships */

	@ApiProperty({ description: 'Note that we want to rate' })
	@ForeignKey(() => Note)
	@Column
	noteId: number

	@BelongsTo(() => Note, { onDelete: 'cascade' })
	note: Note

	@ApiProperty()
	@ForeignKey(() => User)
	@Column
	userId: number

	@BelongsTo(() => User)
	user: User

	/**
   * created_at and updated_at generated automatically by ORM
   */
}

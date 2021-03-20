import {
	AllowNull,
	Model,
	AutoIncrement,
	Column,
	DataType,
	Default,
	PrimaryKey,
	Table,
	Unique
} from 'sequelize-typescript'

@Table({ tableName: 'notes', underscored: true })
export class Note extends Model<Note> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	_id: number

	@AllowNull(false)
	@Column(DataType.INTEGER)
	authorId: number

	@AllowNull(true)
	@Column(DataType.ARRAY(DataType.INTEGER))
	rating: number[]

	@AllowNull(true)
	@Column(DataType.INTEGER)
	timeLength: number

	@Default(false)
	@Column(DataType.BOOLEAN)
	isPublic: boolean

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
	fileId: string

	@Default(false)
	@Column(DataType.BOOLEAN)
	allowDownloads: boolean
}

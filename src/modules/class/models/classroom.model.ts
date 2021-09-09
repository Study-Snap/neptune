import { Model } from 'sequelize'
import { AllowNull, Column, DataType, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'classrooms', underscored: true })
export class Classroom extends Model<Classroom> {
	@PrimaryKey
	@Column(DataType.STRING)
	_id: string

	@AllowNull(false)
	@Column(DataType.STRING)
	name: string

	@AllowNull(false)
	@Column(DataType.INTEGER)
	ownerId: number

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

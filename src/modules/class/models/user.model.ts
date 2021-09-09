import { Model } from 'sequelize'
import { AllowNull, AutoIncrement, Column, DataType, IsEmail, PrimaryKey, Table, Unique } from 'sequelize-typescript'

@Table({ tableName: 'users', underscored: true })
export class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	_id: number

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

	/**
	 * Note: updated_at, created_at fields are automatically generated
	 */
}

import { InternalServerErrorException, Logger } from '@nestjs/common'
import { Dialect, Sequelize } from 'sequelize'
import { IConfigAttributes } from '../common/interfaces/config/app-config.interface'
import { getConfig } from '../config'

export const validateDatabaseConnection = async () => {
	try {
		const config: IConfigAttributes = getConfig()

		// configure connection to the database
		const connection: Sequelize = new Sequelize({
			dialect: config.dbDialect as Dialect,
			host: config.dbHost,
			port: config.dbPort as number,
			database: config.dbDatabaseName,
			username: config.dbUsername,
			password: config.dbPassword,
			logging: false
		})

		await connection.query(`SELECT NOW()`)
		Logger.log(`[DB-HEALTHCHECK] status [Success]`)
	} catch (err) {
		throw new InternalServerErrorException(`Failed to validate database connectivity. Reason: ${err}`)
	}
}

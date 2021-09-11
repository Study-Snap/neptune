import { ClassModule } from './modules/class/class.module'
import { FilesModule } from './modules/files/files.module'
import { NotesModule } from './modules/notes/notes.module'
import { AuthModule } from './modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Dialect } from 'sequelize'
import { getConfig } from './config'
import { IConfigAttributes } from './common/interfaces/config/app-config.interface'
import { DB_CONNECTION_NAME } from './common/constants'

// Get App Config
const config: IConfigAttributes = getConfig()

@Module({
	imports: [
		ClassModule,
		FilesModule,
		NotesModule,
		AuthModule,
		SequelizeModule.forRoot({
			name: DB_CONNECTION_NAME,
			dialect: config.dbDialect as Dialect,
			host: config.dbHost,
			port: config.dbPort as number,
			database: config.dbDatabaseName,
			username: config.dbUsername,
			password: config.dbPassword,
			retryAttempts: config.dbRetryAttempts as number,
			autoLoadModels: true,
			synchronize: true,
			logging: false
		})
	],
	controllers: [],
	providers: []
})
export class AppModule {}

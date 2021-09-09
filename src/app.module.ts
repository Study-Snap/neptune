import { ClassModule } from './modules/class/class.module'
import { FilesModule } from './modules/files/files.module'
import { NotesModule } from './modules/notes/notes.module'
import { AuthModule } from './modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Dialect } from 'sequelize'
import { getConfig } from './config'
import { IConfigAttributes } from './common/interfaces/config/app-config.interface'

// Get App Config
const config: IConfigAttributes = getConfig()

@Module({
	imports: [
		ClassModule,
		FilesModule,
		NotesModule,
		AuthModule,
		SequelizeModule.forRoot({
			dialect: config.dbDialect as Dialect,
			host: config.dbNoteHost,
			port: config.dbNotePort as number,
			database: config.dbNoteDatabase,
			username: config.dbNoteUsername,
			password: config.dbNotePassword,
			retryAttempts: config.dbRetryAttempts as number,
			autoLoadModels: true,
			synchronize: true,
			logging: false
		}),
		SequelizeModule.forRoot({
			dialect: config.dbDialect as Dialect,
			host: config.dbClassHost,
			port: config.dbClassPort as number,
			database: config.dbClassDatabase,
			username: config.dbClassUsername,
			password: config.dbClassPassword,
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

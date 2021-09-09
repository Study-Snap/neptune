import { ClassModule } from './modules/class/class.module'
import { FilesModule } from './modules/files/files.module'
import { NotesModule } from './modules/notes/notes.module'
import { AuthModule } from './modules/auth/auth.module'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Dialect } from 'sequelize'
import { getConfig } from './config'
import { IConfigAttributes } from './common/interfaces/config/app-config.interface'
import { CLASS_DB_CONNECTION, NOTE_DB_CONNECTION } from './common/constants'

// Get App Config
const config: IConfigAttributes = getConfig()

@Module({
	imports: [
		ClassModule,
		FilesModule,
		NotesModule,
		AuthModule,
		SequelizeModule.forRoot({
			name: NOTE_DB_CONNECTION,
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
			name: CLASS_DB_CONNECTION,
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

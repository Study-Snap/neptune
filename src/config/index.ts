import { DEVELOPMENT, PRODUCTION, TEST } from '../common/constants'
import { IConfig } from '../common/interfaces/config/app-config.interface'
import * as dotenv from 'dotenv'
dotenv.config()

/*
	NOTE: Ensure that JWT_SECRET is the same secret used in signing access tokens on AUTH_BASE_URL
*/

const appConfig: IConfig = {
	development: {
		listenPort: process.env.PORT || 5555,
		maxRequests: parseInt(process.env.MAX_REQUESTS) || 250,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbHost: process.env.DB_HOST || 'localhost',
		dbPort: process.env.DB_PORT || 5432,
		dbUsername: process.env.DB_USER,
		dbPassword: process.env.DB_PASS,
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_notedb',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'dev_secret_do_change_in_prod',
		fileStorageLocation: process.env.FILE_STORE
	},
	test: {
		listenPort: process.env.PORT || 5555,
		maxRequests: 999,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbHost: process.env.DB_HOST || 'localhost',
		dbPort: process.env.DB_PORT || 8888,
		dbUsername: process.env.DB_USER || 'studysnap',
		dbPassword: process.env.DB_PASS || 'snapstudy',
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_testdb',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'test',
		fileStorageLocation: process.env.FILE_STORE || './tmp/'
	},
	production: {
		listenPort: process.env.PORT || 5555,
		maxRequests: parseInt(process.env.MAX_REQUESTS) || 250,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbHost: process.env.DB_HOST,
		dbPort: process.env.DB_PORT || 5432,
		dbUsername: process.env.DB_USER,
		dbPassword: process.env.DB_PASS,
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_notedb',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 5,
		jwtSecret: process.env.JWT_SECRET,
		fileStorageLocation: process.env.FILE_STORE
	}
}

export const getConfig = () => {
	switch (process.env.NODE_ENV) {
		case DEVELOPMENT:
			return appConfig.development
		case TEST:
			return appConfig.test
		case PRODUCTION:
			return appConfig.production
		default:
			return appConfig.development
	}
}

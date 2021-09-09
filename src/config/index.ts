import { DEVELOPMENT, PRODUCTION, TEST } from '../common/constants'
import { IConfig } from '../common/interfaces/config/app-config.interface'
import * as dotenv from 'dotenv'
dotenv.config()

// Import env vars from appropriate file
switch (process.env.NODE_ENV) {
	case DEVELOPMENT:
		dotenv.config({ path: '.dev.env' })
		break
	case TEST:
		dotenv.config({ path: '.test.env' })
	case PRODUCTION:
		dotenv.config({ path: '.prod.env' })
	default:
		dotenv.config()
		break
}

/*
	NOTE: Ensure that JWT_SECRET is the same secret used in signing access tokens on AUTH_BASE_URL
*/

const appConfig: IConfig = {
	development: {
		listenPort: process.env.PORT || 5555,
		maxRequests: parseInt(process.env.MAX_REQUESTS) || 250,
		esVersion: process.env.ES_TARGET_VERSION || '7.x',
		esHost: process.env.ES_HOST || 'localhost',
		esPort: process.env.ES_PORT || 9200,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbNoteHost: process.env.DB_NOTE_HOST || 'localhost',
		dbNotePort: process.env.DB_NOTE_PORT || 5432,
		dbNoteUsername: process.env.DB_NOTE_USER,
		dbNotePassword: process.env.DB_NOTE_PASS,
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_notedb',
		dbClassHost: process.env.DB_CLASS_HOST || 'localhost',
		dbClassPort: process.env.DB_CLASS_PORT || 5432,
		dbClassDatabase: process.env.DB_CLASS_DATABASE || 'studysnap_classdb',
		dbClassUsername: process.env.DB_CLASS_USER,
		dbClassPassword: process.env.DB_CLASS_PASS,
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'dev_secret_do_change_in_prod',
		fileStorageLocation: process.env.FILE_STORE
	},
	test: {
		listenPort: process.env.PORT || 7777,
		testAuthHost: process.env.TEST_AUTH_HOST || 'localhost',
		testAuthPort: process.env.TEST_AUTH_PORT || 5555,
		testAuthBasePath: process.env.TEST_AUTH_BASE_PATH || 'auth',
		maxRequests: 999,
		esVersion: process.env.ES_TARGET_VERSION || '7.x',
		esHost: process.env.ES_HOST || 'localhost',
		esPort: process.env.ES_PORT || 9200,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbNoteHost: process.env.DB_HOST || 'localhost',
		dbNotePort: process.env.DB_PORT || 8888,
		dbNoteUsername: process.env.DB_USER || 'studysnap',
		dbNotePassword: process.env.DB_PASS || 'snapstudy',
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_testdb',
		dbClassHost: process.env.DB_CLASS_HOST || 'localhost',
		dbClassPort: process.env.DB_CLASS_PORT || 5432,
		dbClassDatabase: process.env.DB_CLASS_DATABASE || 'studysnap_classdb',
		dbClassUsername: process.env.DB_CLASS_USER,
		dbClassPassword: process.env.DB_CLASS_PASS,
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'test',
		fileStorageLocation: process.env.FILE_STORE || './tmp/'
	},
	production: {
		listenPort: process.env.PORT || 5555,
		maxRequests: parseInt(process.env.MAX_REQUESTS) || 250,
		esVersion: process.env.ES_TARGET_VERSION || '7.x',
		esHost: process.env.ES_HOST,
		esPort: process.env.ES_PORT || 9200,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbNoteHost: process.env.DB_HOST,
		dbNotePort: process.env.DB_PORT || 5432,
		dbNoteUsername: process.env.DB_USER,
		dbNotePassword: process.env.DB_PASS,
		dbNoteDatabase: process.env.DB_NOTE_DATABASE || 'studysnap_notedb',
		dbClassHost: process.env.DB_CLASS_HOST || 'localhost',
		dbClassPort: process.env.DB_CLASS_PORT || 5432,
		dbClassDatabase: process.env.DB_CLASS_DATABASE || 'studysnap_classdb',
		dbClassUsername: process.env.DB_CLASS_USER,
		dbClassPassword: process.env.DB_CLASS_PASS,
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

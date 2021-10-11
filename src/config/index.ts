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
		dbHost: process.env.DB_HOST || 'localhost',
		dbPort: process.env.DB_PORT || 5432,
		dbUsername: process.env.DB_USER,
		dbPassword: process.env.DB_PASS,
		dbDatabaseName: process.env.DB_DATABASE_NAME || 'studysnap_db',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'dev_secret_do_change_in_prod',
		spacesEndpoint: process.env.SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com',
		spacesKey: process.env.SPACES_KEY,
		spacesSecret: process.env.SPACES_SECRET,
		noteDataSpace: process.env.NOTE_DATA_SPACE || 'notesdata',
		imageDataSpace: process.env.IMAGE_DATA_SPACE || 'ssimages'
	},
	test: {
		listenPort: process.env.PORT || 7777,
		testAuthHost: process.env.TEST_AUTH_HOST || 'localhost',
		testAuthPort: process.env.TEST_AUTH_PORT || 5555,
		testAuthBasePath: process.env.TEST_AUTH_BASE_PATH || '',
		maxRequests: 999,
		esVersion: process.env.ES_TARGET_VERSION || '7.x',
		esHost: process.env.ES_HOST || 'localhost',
		esPort: process.env.ES_PORT || 9200,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbHost: process.env.DB_HOST || 'localhost',
		dbPort: process.env.DB_PORT || 8888,
		dbUsername: process.env.DB_USER || 'studysnap',
		dbPassword: process.env.DB_PASS || 'snapstudy',
		dbDatabaseName: process.env.DB_DATABASE_NAME || 'studysnap_db',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 2,
		jwtSecret: process.env.JWT_SECRET || 'test',
		spacesEndpoint: process.env.SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com',
		spacesKey: process.env.SPACES_KEY,
		spacesSecret: process.env.SPACES_SECRET,
		noteDataSpace: process.env.NOTE_DATA_SPACE || 'notesdata',
		imageDataSpace: process.env.IMAGE_DATA_SPACE || 'ssimages'
	},
	production: {
		listenPort: process.env.PORT || 5555,
		maxRequests: parseInt(process.env.MAX_REQUESTS) || 250,
		esVersion: process.env.ES_TARGET_VERSION || '7.x',
		esHost: process.env.ES_HOST,
		esPort: process.env.ES_PORT || 9200,
		dbDialect: process.env.DB_DIALECT || 'postgres',
		dbHost: process.env.DB_HOST,
		dbPort: process.env.DB_PORT || 5432,
		dbUsername: process.env.DB_USER,
		dbPassword: process.env.DB_PASS,
		dbDatabaseName: process.env.DB_DATABASE_NAME || 'studysnap_db',
		dbRetryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 5,
		jwtSecret: process.env.JWT_SECRET,
		spacesEndpoint: process.env.SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com',
		spacesKey: process.env.SPACES_KEY,
		spacesSecret: process.env.SPACES_SECRET,
		noteDataSpace: process.env.NOTE_DATA_SPACE || 'notesdata',
		imageDataSpace: process.env.IMAGE_DATA_SPACE || 'ssimages'
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

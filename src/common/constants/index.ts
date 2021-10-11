import { getConfig } from '../../config/'
import { IConfigAttributes } from '../interfaces/config/app-config.interface'

const config: IConfigAttributes = getConfig()

// Project constants
export const PROJECT_VERSION = '0.3.0'
export const SEQUELIZE = 'SEQUELIZE'
export const JWT_STRATEGY = 'jwt'
export const DEVELOPMENT = 'development'
export const TEST = 'test'
export const PRODUCTION = 'production'

// Connections
export const DB_CONNECTION_NAME = 'SS_DB_CONNECTION'

// Field Constants (for db access)
export const DB_USERS_PASSWORD_FIELD = 'password'

// Spaces
export const DO_NOTE_DATA_SPACE = config.noteDataSpace
export const DO_IMAGE_DATA_SPACE = config.imageDataSpace

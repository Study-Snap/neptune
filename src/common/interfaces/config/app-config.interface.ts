export interface IConfigAttributes {
	listenPort: number | string
	testAuthBasePath?: string
	testAuthHost?: string
	testAuthPort?: number | string
	maxRequests: number
	dbDialect: string
	dbHost: string
	dbPort: number | string
	dbNoteDatabase: string
	dbUsername: string
	dbPassword: string
	dbRetryAttempts: number | string
	jwtSecret: string
	fileStorageLocation: string
}

export interface IConfig {
	development: IConfigAttributes
	test: IConfigAttributes
	production: IConfigAttributes
}

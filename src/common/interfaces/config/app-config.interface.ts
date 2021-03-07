export interface IConfigAttributes {
	listenPort: number | string
	maxRequests: number
	authBaseURL: string
	dbDialect: string
	dbHost: string
	dbPort: number | string
	dbNoteDatabase: string
	dbUsername: string
	dbPassword: string
	dbRetryAttempts: number | string
	jwtSecret: string
}

export interface IConfig {
	development: IConfigAttributes
	test: IConfigAttributes
	production: IConfigAttributes
}

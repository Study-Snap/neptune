export interface IConfigAttributes {
	listenPort: number | string
	testAuthBasePath?: string
	testAuthHost?: string
	testAuthPort?: number | string
	esVersion: string
	esHost: string
	esPort: number | string
	esUser?: string
	esPassword?: string
	maxRequests: number
	dbDialect: string
	dbHost: string
	dbPort: number | string
	dbDatabaseName: string
	dbUsername: string
	dbPassword: string
	dbRetryAttempts: number | string
	jwtSecret: string
	spacesEndpoint: string
	spacesKey: string
	spacesSecret: string
	noteDataSpace: string
}

export interface IConfig {
	development: IConfigAttributes
	test: IConfigAttributes
	production: IConfigAttributes
}

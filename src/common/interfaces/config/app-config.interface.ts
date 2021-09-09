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
	dbNoteHost: string
	dbNotePort: number | string
	dbNoteDatabase: string
	dbNoteUsername: string
	dbNotePassword: string
	dbClassHost: string
	dbClassPort: number | string
	dbClassDatabase: string
	dbClassUsername: string
	dbClassPassword: string
	dbRetryAttempts: number | string
	jwtSecret: string
	fileStorageLocation: string
}

export interface IConfig {
	development: IConfigAttributes
	test: IConfigAttributes
	production: IConfigAttributes
}

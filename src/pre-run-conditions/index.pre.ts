import { Logger } from '@nestjs/common'
import { validateDatabaseConnection } from './db.pre'
import { validateElasticsearchConnectivity } from './elasticsearch.pre'
import { validateS3Connectivity } from './spaces.pre'

export const runPreRunConditionChecks = async () => {
	try {
		// Check S3 Conditions (connectivity & auth)
		await validateS3Connectivity()
		// Check ES Conditions
		await validateElasticsearchConnectivity()
		// Check DB Conditions
		await validateDatabaseConnection()
	} catch (err) {
		Logger.error(err.message)
		process.exit(1)
	}
}

import { IConfigAttributes } from '../common/interfaces/config/app-config.interface'
import { getConfig } from '../config'
import { Endpoint, S3 } from 'aws-sdk'
import { InternalServerErrorException, Logger } from '@nestjs/common'

export const validateS3Connectivity = async () => {
	const config: IConfigAttributes = getConfig()
	const s3 = new S3({
		endpoint: new Endpoint(config.spacesEndpoint),
		accessKeyId: config.spacesKey,
		secretAccessKey: config.spacesSecret
	})

	try {
		const buckets = await s3.listBuckets().promise()
		Logger.log(`[S3-SPACES-HEALTHCHECK] status [${!buckets.$response.error && 'Success'}]`)
	} catch (err) {
		throw new InternalServerErrorException(`Failed to validate S3 parameters and connectivity. Reason: ${err}`)
	}
}

import { Client } from '@elastic/elasticsearch'
import { InternalServerErrorException, Logger } from '@nestjs/common'
import { IConfigAttributes } from '../common/interfaces/config/app-config.interface'
import { getConfig } from '../config'

export const validateElasticsearchConnectivity = async () => {
	try {
		const config: IConfigAttributes = getConfig()
		const esClient = new Client({ node: `http://${config.esHost}:${config.esPort}` })

		const status = await esClient.cluster.health({})
		Logger.log(`[ES-HEALTHCHECK] status [${status.statusCode === 200 && 'Success'}]`)
	} catch (err) {
		throw new InternalServerErrorException(`Failed to reach a live Elasticsearch instance. Reason: ${err}`)
	}
}

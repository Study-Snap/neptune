import { Injectable, NotFoundException } from '@nestjs/common'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import * as elasticsearch from 'elasticsearch'
import { Note } from './models/notes.model'

// Get required config for ES service
const config: IConfigAttributes = getConfig()

@Injectable()
export class ElasticsearchService {
	private esClient: any
	constructor() {
		this.esClient = new elasticsearch.Client({
			host: `${config.esHost}:${config.esPort}`,
			log: 'error',
			apiVersion: config.esVersion // Ensure this version matches the running es service version
		})
	}

	async searchNotesForQuery(searchType: string, searchQuery: string, defaultField?: string): Promise<object> {
		const res = await this.esClient.search(
			{
				index: Note.tableName,
				body: {
					query: {
						[searchType]: {
							q: searchQuery,
							df: defaultField
						}
					}
				}
			},
			{
				ignore: [
					404
				],
				maxRetries: 3
			}
		)

		if (!res || !res.hits.hits || res.hits.hits.length === 0) {
			throw new NotFoundException('Could not find results for the supplied search query')
		}

		return res.hits.hits
	}
}

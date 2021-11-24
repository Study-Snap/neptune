import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { Client } from '@elastic/elasticsearch'
import { Note } from './models/notes.model'

// Get required config for ES service
const config: IConfigAttributes = getConfig()

/**
 * Service class that handles all elasticsearch functionality for us by abstracting away some of the complexities in the provided official elasticsearch SDK
 */
@Injectable()
export class ElasticsearchService {
	private esClient: any
	constructor() {
		this.esClient = new Client({
			node: `http://${config.esHost}:${config.esPort}`
		})
	}

	/**
	 * Performs a search on the ES index using the elasticsearch SDK
	 * @param searchType The type of search to perform (supported are: https://www.elastic.co/guide/en/elasticsearch/reference/current/search-your-data.html#common-search-options)
	 * @param searchQuery The actual query value to pass to elasticsearch (must be valid format for selected searchType)
	 * @returns 
	 */
	async searchNotesForQuery(searchType: string, searchQuery: object): Promise<object[]> {
		const res = await this.esClient.search(
			{
				index: Note.tableName,
				body: {
					query: {
						[searchType]: searchQuery
					}
				}
			},
			{
				ignore: [ 404 ],
				maxRetries: 3
			}
		)

		if (!res.body || !res.body.hits || !res.body.hits.hits || res.body.hits.hits.length === 0) {
			throw new NotFoundException('Could not find results for the supplied search query')
		}

		return res.body.hits.hits
	}

	/**
	 * Removes a note from the ES index
	 * @param noteId Unique ID for a note in the ES cluster index
	 */
	async deleteNoteWithIDFromES(noteId: number): Promise<void> {
		const res = await this.esClient.deleteByQuery({
			index: Note.tableName,
			body: {
				query: {
					term: { id: noteId }
				}
			}
		})

		switch (res.statusCode) {
			case 404:
				throw new NotFoundException(`Could not find a note with the specified ID (${noteId}) in the ES index.`)
			case 500:
				throw new InternalServerErrorException(`Failed to delete note from elasticsearch index with id ${noteId}.`)
			default:
				break
		}
	}
}

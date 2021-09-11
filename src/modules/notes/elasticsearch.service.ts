import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { Client } from '@elastic/elasticsearch'
import { Note } from './models/notes.model'

// Get required config for ES service
const config: IConfigAttributes = getConfig()

@Injectable()
export class ElasticsearchService {
	private esClient: any
	constructor() {
		this.esClient = new Client({
			node: `http://${config.esHost}:${config.esPort}`
		})
	}

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

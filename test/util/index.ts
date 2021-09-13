import axios, { AxiosRequestConfig } from 'axios'
import { IConfigAttributes } from '../../src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../src/config'
import { Client } from '@elastic/elasticsearch'
import { Note } from '../../src/modules/notes/models/notes.model'

// Init
const config: IConfigAttributes = getConfig()
const esClient: any = new Client({
	node: `http://${config.esHost}:${config.esPort}`
})

export const TEST_AUTH_URL = `http://${config.testAuthHost}:${config.testAuthPort}/${config.testAuthBasePath}`
export const TEST_USERNAME = 'test_sa@example.com'
export const TEST_PASSWORD = '02809b3927fcc767ad65ce8a6e57afce'

// Function for creating a test account on auth
export const createTestAccountForE2e = async () => {
	const options: AxiosRequestConfig = {
		method: 'POST',
		url: `${TEST_AUTH_URL}/register`,
		data: {
			firstName: 'John',
			lastName: 'Doe',
			email: TEST_USERNAME,
			password: TEST_PASSWORD
		},
		responseType: 'json'
	}

	try {
		const res = await axios(options)
		return res.status === 201
	} catch (err) {
		if (`${err}`.includes('409')) {
			return
		}
		console.log(
			`Something happened when creating a test account. This may be nothing to worry about. Here is what we got: ${err}`
		)
		return
	}
}

// Function for retrieving an access token for auth in testing
export const getAccessTokenFromAuth = async (email: string, password: string) => {
	const options: AxiosRequestConfig = {
		method: 'POST',
		url: `${TEST_AUTH_URL}/login`,
		data: {
			email: email,
			password: password
		}
	}

	const res = await axios(options)

	return res.data.accessToken
}

export const populateESIndexForTest = async (noteId: number) => {
	// Check if index already exists
	const exists = await esClient.indices.exists({ index: `${Note.tableName}` })

	// Create the index (if needed)
	let createIndexRes: any
	if (exists.statusCode !== 200) {
		createIndexRes = await esClient.indices.create(
			{
				index: Note.tableName,
				body: {
					mappings: {
						properties: {
							id: { type: 'text' },
							title: { type: 'text' },
							keywords: { type: 'text' },
							shortDescription: { type: 'text' }
						}
					}
				}
			},
			{
				ignore: [ 400, 409 ]
			}
		)
	}

	// Insert a document for use in testing
	if (exists.statusCode === 200 || createIndexRes.statusCode === 200 || createIndexRes.statusCode === 409) {
		// Insert test document
		await esClient.index({
			index: `${Note.tableName}`,
			id: 55,
			body: {
				id: noteId,
				title: 'Science 101',
				keywords: [ 'science', 'how-to' ],
				shortDescription: 'A note all about the science of biology and stuff'
			}
		})
	} else {
		throw new Error('Failed to create ES index...is the client configured properly? Is the service running?')
	}
}

import axios, { AxiosRequestConfig } from 'axios'
import { IConfigAttributes } from '../../src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../src/config'
import { Client } from '@elastic/elasticsearch'
import { Note } from '../../src/modules/notes/models/notes.model'
import { Endpoint, S3 } from 'aws-sdk'
import { InternalServerErrorException } from '@nestjs/common'

// Init
const config: IConfigAttributes = getConfig()
const esClient: any = new Client({
	node: `http://${config.esHost}:${config.esPort}`
})

export const TEST_AUTH_URL = `http://${config.testAuthHost}:${config.testAuthPort}${config.testAuthBasePath}`
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

	// Delete the index (if exists already)
	if (exists.statusCode === 200) {
		await esClient.indices.delete({
			index: Note.tableName,
			timeout: '50s',
			ignore_unavailable: false,
			allow_no_indices: false
		})
	}

	// Create the index
	const createIndexRes = await esClient.indices.create(
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

		// Perform an index refresh to ensure that the data is available for tests
		await esClient.indices.refresh({
			index: Note.tableName,
			ignore_unavailable: false,
			allow_no_indices: false
		})
	} else {
		throw new Error('Failed to create ES index...is the client configured properly? Is the service running?')
	}
}

export const testRemoteFileExists = async (fileUri: string): Promise<boolean> => {
	// Init Spaces Connection
	const s3 = new S3({
		endpoint: new Endpoint(config.spacesEndpoint),
		accessKeyId: config.spacesKey,
		secretAccessKey: config.spacesSecret
	})

	// Configure params for S3
	const params = {
		Bucket: config.noteDataSpace,
		Key: fileUri
	}

	// Check if object exists in S3
	try {
		const headCode = await s3.headObject(params).promise()
		return headCode.ContentLength > 0
	} catch (err) {
		if (err.code === 'NotFound') {
			return false
		}
		throw new InternalServerErrorException(`An unknown error occurred when verifying file exists`)
	}
}

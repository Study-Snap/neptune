import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Dialect, Sequelize } from 'sequelize'
import { AppModule } from '../src/app.module'
import * as request from 'supertest'
import { readFile } from 'fs/promises'
import { createTestAccountForE2e, getAccessTokenFromAuth, TEST_PASSWORD, TEST_USERNAME } from './util'
import { IConfigAttributes } from '../src/common/interfaces/config/app-config.interface'
import { getConfig } from '../src/config'
import { DeleteNoteDto } from 'src/modules/notes/dto/delete-note.dto'

const config: IConfigAttributes = getConfig()

describe('Neptune', () => {
	let app: INestApplication
	let connection: Sequelize

	// File params
	const goodFileTestPath = 'test/files/capstone_pp.pdf'
	let resGoodFileUri: string
	let resBadFileUri: string

	// For use in testing prodected endpoints
	let jwtToken: string

	// Setup test environment
	beforeAll(async () => {
		const testModule: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

		// Get Database connection
		connection = new Sequelize({
			dialect: config.dbDialect as Dialect,
			host: config.dbHost,
			port: config.dbPort as number,
			database: config.dbNoteDatabase,
			username: config.dbUsername,
			password: config.dbPassword,
			logging: false
		})

		// Remove existing notes in the test database
		await connection.query(`DELETE FROM ONLY notes`, { logging: false })

		// TODO: Load some test data using raw INSERT (data from ./data)

		// Create app context
		app = testModule.createNestApplication<NestExpressApplication>()
		app.useGlobalPipes(
			new ValidationPipe({
				forbidUnknownValues: true,
				whitelist: true,
				forbidNonWhitelisted: true
			})
		)

		// Create test account and set credentials
		await createTestAccountForE2e()
		jwtToken = await getAccessTokenFromAuth(TEST_USERNAME, TEST_PASSWORD)

		// Start the server for testing
		await app.init()
	})

	describe('FilesController', () => {
		const FILE_BASE_URL = '/neptune/files'

		describe('Upload note files', () => {
			it('should create a new note file with valid authorization and OTHER non-optimal file format', async () => {
				// Create a buffer file
				const buffer = Buffer.from('docx formatted data some note data')

				// Create note file with ID
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.attach('file', buffer, 'test_file.docx')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body.fileUri).toBeDefined()

				// Save file upload response
				resBadFileUri = res.body.fileUri
			})

			it('should create note with valid optimal PDF and authorization in form-data', async () => {
				// Get valid PDF formatted file from test (true expected format)
				const file = await readFile(goodFileTestPath)
				const buffer = Buffer.from(file)

				console.log('GOT BUFFER')
				// Create note file with ID
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.attach('file', buffer, 'test_pdf_file.pdf')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body.fileUri).toBeDefined()

				// Save file upload response
				resGoodFileUri = res.body.fileUri
			})

			it('should fail to create a new note upload without proper authorization', async () => {
				// Create a buffer file as usual
				const buffer = Buffer.from('some note data')

				// Attempt to create a note file without authorization header (or invalid one)
				const res = await request(app.getHttpServer()).post(`${FILE_BASE_URL}`).attach('file', buffer, 'test_file.pdf')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})
		})
	})

	describe('NotesController', () => {
		const NOTE_BASE_URL = '/neptune/notes'
		let noteId: number // Useful for later tests

		describe('Authenticated Endpoints', () => {
			it('/test: should get a 200 response with a valid access token', async () => {
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/test`)
					.set('Authorization', `Bearer ${jwtToken}`)

				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).not.toBeUndefined()
			})

			it('/test: should be unauthorized with invalid access token', async () => {
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/test`)
					.set('Authorization', 'Bearer bad_token')

				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
				expect(res.body.statusCode).toBe(401)
			})
		})

		describe('Note Creation', () => {
			it('should create a new note with valid PDF file and fields according to DTO spec', async () => {
				// Create the note with file
				const reqData = {
					title: 'Science 101',
					shortDescription: 'A short description about the note',
					fileUri: resGoodFileUri,
					keywords: ['biology', 'chemestry', 'Physics'],
					isPublic: true,
					allowDownloads: true
				}

				// Create actual note with file
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body.title).toMatch(reqData.title)

				// Store noteID for later tests
				noteId = res.body._id
			})

			it('should create a new note with other (docx) file but not process PDF extraction and provide warn', async () => {
				// Create the note with file
				const reqData = {
					title: 'A Science note',
					shortDescription: 'A short description about the docx note',
					fileUri: resBadFileUri,
					keywords: ['biology', 'chemestry', 'Physics'],
					isPublic: true,
					allowDownloads: true
				}

				// Create actual note with file
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body.title).toMatch(reqData.title)
				expect(res.body.body).toMatch('BAD FORMAT')
			})

			it('should fail to create a new note if a file is not provided', async () => {
				const reqData = {
					title: 'Science 101',
					shortDescription: 'A short description about the note',
					keywords: ['biology', 'chemestry', 'Physics'],
					isPublic: true,
					allowDownloads: true
				}

				// Create actual note with file
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
			})

			it('should fail to create a new note if specified file does not exist', async () => {
				const reqData = {
					title: 'Science 101',
					shortDescription: 'A short description about the note',
					fileUri: 'fake-nonexist-file-id',
					keywords: ['biology', 'chemestry', 'Physics'],
					isPublic: true,
					allowDownloads: true
				}

				// Create actual note with file
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
			})
		})

		describe('Note Querying', () => {
			it('should find a single note by ID', async () => {
				const res = await request(app.getHttpServer()).get(`${NOTE_BASE_URL}/${noteId}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.title).toBeDefined()
			})

			it('should respond with not found if invalid id is passed', async () => {
				const res = await request(app.getHttpServer()).get(`${NOTE_BASE_URL}/999999`)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
				expect(res.body.title).toBeUndefined()
			})
		})

		describe('Note Update and Delete', () => {
			it('should update a note with given id with set of acceptable fields', async () => {
				const reqData = {
					noteId: noteId,
					newData: {
						isPublic: true,
						allowDownloads: false
					}
				}

				// Perform update to isPublic and allowDownloads
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body.isPublic).toBe(true)
				expect(res.body.allowDownloads).toBe(false)
			})

			it('should fail to update without authorization of author', async () => {
				const reqData = {
					noteId: noteId,
					newData: {
						isPublic: true,
						allowDownloads: false
					}
				}

				// Attempt unauthorized update to isPublic and allowDownloads
				const res = await request(app.getHttpServer()).put(`${NOTE_BASE_URL}`).send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should fail to delete note with fake id', async () => {
				const badRequestData: DeleteNoteDto = {
					noteId: 9999999,
					fileUri: resGoodFileUri
				}
				const res = await request(app.getHttpServer())
					.del(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(badRequestData)

				// Verify Results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
			})

			it('should fail to delete note without authorization', async () => {
				const reqData: DeleteNoteDto = {
					noteId,
					fileUri: resGoodFileUri
				}
				const res = await request(app.getHttpServer()).del(`${NOTE_BASE_URL}`).send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should delete note with valid id', async () => {
				const reqData: DeleteNoteDto = {
					noteId,
					fileUri: resGoodFileUri
				}
				const res = await request(app.getHttpServer())
					.del(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
			})
		})
	})

	afterAll(async () => {
		// Close server
		await app.close()

		// Close db connections
		await connection.close()
	})
})

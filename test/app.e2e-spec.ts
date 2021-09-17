import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Dialect, Sequelize } from 'sequelize'
import { AppModule } from '../src/app.module'
import * as request from 'supertest'
import { readFile } from 'fs/promises'
import {
	createTestAccountForE2e,
	getAccessTokenFromAuth,
	TEST_PASSWORD,
	TEST_USERNAME,
	populateESIndexForTest
} from './util'
import { IConfigAttributes } from '../src/common/interfaces/config/app-config.interface'
import { getConfig } from '../src/config'
import { DeleteNoteDto } from '../src/modules/notes/dto/delete-note.dto'
import { CreateNoteDto } from 'src/modules/notes/dto/create-note.dto'
import { SearchNoteDto } from 'src/modules/notes/dto/search-note.dto'
import { CreateClassroomDto } from 'src/modules/class/dto/create-classroom.dto'
import { UpdateClassroomDto } from 'src/modules/class/dto/update-classroom.dto'
import { DeleteClassroomDto } from 'src/modules/class/dto/delete-classroom.dto'

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

	// Classroom test data
	const testClasses = [
		{
			id: 'test',
			name: 'ABC Class',
			ownerId: 1
		},
		{
			id: 'test2',
			name: 'Software Class',
			ownerId: 2
		},
		{
			id: 'test3',
			name: 'Testing Class',
			ownerId: 1
		},
		{
			id: 'test4',
			name: 'Sheharyaar Class',
			ownerId: 1
		}
	]

	// Setup test environment
	beforeAll(async () => {
		const testModule: TestingModule = await Test.createTestingModule({
			imports: [ AppModule ]
		}).compile()

		// Get Database connection
		connection = new Sequelize({
			dialect: config.dbDialect as Dialect,
			host: config.dbHost,
			port: config.dbPort as number,
			database: config.dbDatabaseName,
			username: config.dbUsername,
			password: config.dbPassword,
			logging: false
		})

		// Remove existing data from various tables in the database
		await connection.query(`DELETE FROM ONLY notes`, { logging: false })
		await connection.query(`DELETE FROM ONLY classrooms`, { logging: false })
		await connection.query(`DELETE FROM ONLY classrooms_users`, { logging: false })
		await connection.query(`DELETE FROM ONLY users`, { logging: false })

		// Add some test data for classrooms
		for (const c of testClasses) {
			await connection.query(
				`INSERT INTO classrooms (id, name, owner_id, created_at, updated_at) VALUES ('${c.id}', '${c.name}', ${c.ownerId}, '2021-01-01', '2021-01-01')`,
				{
					logging: false
				}
			)
		}

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
		const FILE_BASE_URL = '/files'

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
		const NOTE_BASE_URL = '/notes'
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
				const reqData: CreateNoteDto = {
					title: 'Science 101',
					shortDescription: 'A short description about the note',
					fileUri: resGoodFileUri,
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[0].id
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
				noteId = res.body.id
			})

			it('should create a new note with other (docx) file but not process PDF extraction and provide warn', async () => {
				// Create the note with file
				const reqData: CreateNoteDto = {
					title: 'A Science note',
					shortDescription: 'A short description about the docx note',
					fileUri: resBadFileUri,
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[0].id
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
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[0].id,
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
				const reqData: CreateNoteDto = {
					title: 'Science 101',
					shortDescription: 'A short description about the note',
					fileUri: 'fake-nonexist-file-id',
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[0].id
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
			beforeAll(async () => {
				await populateESIndexForTest(noteId)
			})

			it('should find a single note by ID', async () => {
				console.log(noteId)
				const res = await request(app.getHttpServer()).get(`${NOTE_BASE_URL}/by-id/${noteId}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.title).toBeDefined()
			})

			it('should respond with not found if invalid id is passed', async () => {
				const res = await request(app.getHttpServer()).get(`${NOTE_BASE_URL}/by-id/999999`)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
				expect(res.body.title).toBeUndefined()
			})

			it('should not find a note using using elasticsearch on /search with random garbage', async () => {
				const reqData: SearchNoteDto = {
					queryType: 'query_string',
					query: {
						query: 'randaopwdiuahwda 76dta67wt d6aw'
					}
				}

				// Perform the search
				const res = await request(app.getHttpServer()).post(`${NOTE_BASE_URL}/search`).send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
				expect(res.body).not.toBeUndefined()
			})

			// TODO: Add test for searching elasticsearch for note that does exist
		})

		describe('Note Update and Delete', () => {
			beforeAll(async () => {
				await populateESIndexForTest(noteId)
			})

			it('should update a note with given id with set of acceptable fields', async () => {
				const reqData = {
					noteId: noteId,
					newData: {
						title: 'ABC Note'
					}
				}

				// Perform update to isPublic and allowDownloads
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body.title).toMatch(reqData.newData.title)
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
					noteId
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

	describe('Classroom Controller', () => {
		const CLASSROOM_BASE_URL = '/classrooms'
		describe('Classroom Queries', () => {
			beforeAll(async () => {
				// Join the test user to the first test classroom
				await connection.query(
					`INSERT INTO classrooms_users (class_id, user_id, created_at, updated_at) VALUES ('${testClasses[0]
						.id}', (SELECT id FROM users WHERE email='${TEST_USERNAME}'), '2021-01-01', '2021-01-01')`,
					{
						logging: false
					}
				)
			})
			it('should provide a list of all classrooms from the test classrooms table', async () => {
				const res = await request(app.getHttpServer()).get(`${CLASSROOM_BASE_URL}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body.length).toBeDefined()
				expect(res.body.length).toBeGreaterThan(0)
				expect(res.body[0].name).toMatch(/^(ABC).*/g)
			})

			it(`should get the '${testClasses[0].name}' class by using the ID, ${testClasses[0]
				.id}, and searching the classrooms database`, async () => {
				const res = await request(app.getHttpServer()).get(`${CLASSROOM_BASE_URL}/by-uuid/${testClasses[0].id}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.name).toMatch(`${testClasses[0].name}`)
			})

			it('should present a Forbidden error when trying to list users from a class that the requester is not a part of', async () => {
				const res = await request(app.getHttpServer())
					.get(`${CLASSROOM_BASE_URL}/by-uuid/${testClasses[1].id}/users`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify error
				expect(res.status).toBe(HttpStatus.FORBIDDEN)
			})

			it('should present a Forbidden error when trying to list notes in a class the requester is not a part of', async () => {
				const res = await request(app.getHttpServer())
					.get(`${CLASSROOM_BASE_URL}/by-uuid/${testClasses[1].id}/notes`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify error
				expect(res.status).toBe(HttpStatus.FORBIDDEN)
			})

			it(`should present a list of users part of the ${testClasses[0]
				.name} class which the requester is a part of`, async () => {
				const res = await request(app.getHttpServer())
					.get(`${CLASSROOM_BASE_URL}/by-uuid/${testClasses[0].id}/users`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
				expect(res.body[0].email).toMatch(`${TEST_USERNAME}`)
			})

			it(`should present a list of notes part of the ${testClasses[0]
				.name} class which the requester is a part of`, async () => {
				const res = await request(app.getHttpServer())
					.get(`${CLASSROOM_BASE_URL}/by-uuid/${testClasses[0].id}/notes`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
				expect(res.body[0].title).toMatch(/^.*(Science).*/g)
			})
		})
		describe('Classroom CRUD', () => {
			let testClassID: string
			let testUserId: number

			it('should return the created classroom that is owned by the requesting user', async () => {
				const reqData: CreateClassroomDto = {
					name: 'XYZ Classroom'
				}

				// Make the request to create classroom
				const res = await request(app.getHttpServer())
					.post(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body).toBeDefined()
				expect(res.body.name).toMatch(reqData.name)

				// Store some data for later tests
				testClassID = res.body.id
				testUserId = res.body.ownerId
			})

			it('should update classroom name to new value provided in request', async () => {
				const reqData: UpdateClassroomDto = {
					classId: testClassID,
					data: {
						name: 'HIJ Class'
					}
				}

				// Perform update request
				const res = await request(app.getHttpServer())
					.put(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.name).toMatch(/^(HIJ).*/g)
			})

			it('should fail to update classroom without authorization', async () => {
				const reqData: UpdateClassroomDto = {
					classId: testClassID,
					data: {
						name: 'JKI Class'
					}
				}

				// Perform update request
				const res = await request(app.getHttpServer()).put(`${CLASSROOM_BASE_URL}`).send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should fail to delete classroom not owned by the test user', async () => {
				const reqData: DeleteClassroomDto = {
					classId: testClassID
				}

				// Perform delete
				const res = await request(app.getHttpServer()).delete(`${CLASSROOM_BASE_URL}`).send(reqData)

				// Verify error
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should delete classroom when requester is owner of the classroom', async () => {
				const reqData: DeleteClassroomDto = {
					classId: testClassID
				}

				// Perform delete
				const res = await request(app.getHttpServer())
					.delete(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.message).toMatch(`${testClassID}`)
			})
		})
	})

	describe('Neptune User Controller', () => {
		const USER_BASE_URL = '/users'
		let testUserId: number
		describe('User Data Queries', () => {
			it('should provide data about the test user using the users access token', async () => {
				const res = await request(app.getHttpServer())
					.get(`${USER_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.id).toBeDefined()

				// Store some data for later tests
				testUserId = res.body.id
			})

			it('should provide user data for a user with presented ID', async () => {
				const res = await request(app.getHttpServer()).get(`${USER_BASE_URL}/by-id/${testUserId}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
			})

			it('should list classrooms a selected user is a part of', async () => {
				const res = await request(app.getHttpServer())
					.get(`${USER_BASE_URL}/by-id/${testUserId}/classrooms`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
			})

			it('should provice a list of notes uploaded by a selected user', async () => {
				const res = await request(app.getHttpServer())
					.get(`${USER_BASE_URL}/by-id/${testUserId}/notes`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
			})

			it('should list classrooms for the logged in user', async () => {
				const res = await request(app.getHttpServer())
					.get(`${USER_BASE_URL}/classrooms`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
			})

			it('should list notes uploaded by the requesting user', async () => {
				const res = await request(app.getHttpServer())
					.get(`${USER_BASE_URL}/notes`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThan(0)
			})
		})

		describe('User Classroom Operations', () => {
			it('should join user to a classroom', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/join/${testClasses[3].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[3].id}`)
			})

			it('should remove user from classroom when requested to leave', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/leave/${testClasses[3].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[3].id}`)
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

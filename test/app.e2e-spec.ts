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
	populateESIndexForTest,
	testRemoteFileExists
} from './util'
import { IConfigAttributes } from '../src/common/interfaces/config/app-config.interface'
import { getConfig } from '../src/config'
import { DeleteNoteDto } from '../src/modules/notes/dto/delete-note.dto'
import { CreateNoteDto } from 'src/modules/notes/dto/create-note.dto'
import { SearchNoteDto } from 'src/modules/notes/dto/search-note.dto'
import { CreateClassroomDto } from 'src/modules/class/dto/create-classroom.dto'
import { UpdateClassroomDto } from 'src/modules/class/dto/update-classroom.dto'
import { DeleteClassroomDto } from 'src/modules/class/dto/delete-classroom.dto'
import { RateNoteDto } from '../src/modules/notes/dto/rate-note.dto'
import { Classroom } from '../src/modules/class/models/classroom.model'

const config: IConfigAttributes = getConfig()

describe('Neptune', () => {
	let app: INestApplication
	let connection: Sequelize

	// File params
	const goodFileTestPath = 'test/files/capstone_pp.pdf'
	const goodClassImageTestPath = 'test/files/classroom.jpg'
	let resGoodFileUri: string
	let resBadFileUri: string
	let resGoodImageUri: string

	// For use in testing prodected endpoints
	let jwtToken: string

	// Classroom test data
	const testClasses = [
		{
			id: 'test',
			name: 'ABC Class',
			ownerId: 1,
			thumbnailUri: 'https://ssimages.nyc3.digitaloceanspaces.com/classthumb.jpg'
		},
		{
			id: 'test2',
			name: 'Software Class',
			ownerId: 2,
			thumbnailUri: 'https://ssimages.nyc3.digitaloceanspaces.com/classthumb.jpg'
		},
		{
			id: 'test3',
			name: 'Testing Class',
			ownerId: 1,
			thumbnailUri: 'https://ssimages.nyc3.digitaloceanspaces.com/classthumb.jpg'
		},
		{
			id: 'test4',
			name: 'Sheharyaar Class',
			ownerId: 1,
			thumbnailUri: 'https://ssimages.nyc3.digitaloceanspaces.com/classthumb.jpg'
		}
	]

	// Additional Note IDs (use and create more as needed)
	const testNoteIds = [ 77, 88, 99, 122 ]

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
				`INSERT INTO classrooms (id, name, owner_id, thumbnail_uri, created_at, updated_at) VALUES ('${c.id}', '${c.name}', ${c.ownerId}, '${c.thumbnailUri}', '2021-01-01', '2021-01-01')`,
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
					.post(`${FILE_BASE_URL}/note`)
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
					.post(`${FILE_BASE_URL}/note`)
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
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}/note`)
					.attach('file', buffer, 'test_file.pdf')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should fail to create a new note upload if the file type is not supported (.rtf)', async () => {
				const file = await readFile(goodFileTestPath)
				const buffer = Buffer.from(file)

				// Create note file with ID
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}/note`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.attach('file', buffer, 'test_pdf_file.rtf')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toMatch('Invalid file type for target space')
			})

			it('should create a new image upload with full valid DTO', async () => {
				// Get valid image from path
				const image = await readFile(goodClassImageTestPath)
				const buffer = Buffer.from(image)

				// Attempt to create a new image
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}/image`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.attach('file', buffer, 'classroom.jpg')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.CREATED)
				expect(res.body.fileUri).toBeDefined()

				// Store good image fileUri
				resGoodImageUri = res.body.fileUri
			})

			it('should fail to create a new image that is not a supported format (png or jpg)', async () => {
				// Get valid image from path
				const image = await readFile(goodClassImageTestPath)
				const buffer = Buffer.from(image)

				// Attempt to create a new image with bad/unsupported format
				const res = await request(app.getHttpServer())
					.post(`${FILE_BASE_URL}/image`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.attach('file', buffer, 'classroom.gif')

				// Verify results from file upload
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toMatch('Invalid file type for target space')
			})
		})
	})

	describe('NotesController', () => {
		const NOTE_BASE_URL = '/notes'
		let noteId: number // Useful for later tests

		beforeAll(async () => {
			/**
			 * Ensures that the user added to the test classroom initially so that a note can be uploaded
			 */
			await connection.query(
				`INSERT INTO classrooms_users (class_id, user_id, created_at, updated_at) VALUES ((SELECT id FROM classrooms WHERE id='${testClasses[0]
					.id}'), (SELECT id FROM users WHERE email='${TEST_USERNAME}'), '2021-01-01', '2021-01-01')`,
				{
					logging: false
				}
			)
		})

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
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
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
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
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
				expect(res.body.noteAbstract).toMatch('Cannot automatically extract content from this file')
			})

			it('should throw a validation error if title is empty (or less than 5 characters long)', async () => {
				// Create the note with file
				const reqData: CreateNoteDto = {
					title: '',
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
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
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toBeInstanceOf(Array)
				expect(res.body.message[0]).toMatch('Note title must be at least 5 characters long')
			})

			it('should throw a validation error if title is longer than 25 characters', async () => {
				// Create the note with file
				const reqData: CreateNoteDto = {
					title: 'Note titles should be less than 25 characters',
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
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
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toBeInstanceOf(Array)
				expect(res.body.message[0]).toMatch('Note title must be less than 25 characters long')
			})

			it('should throw a validation error if shortDescription is shorter than 60 characters long', async () => {
				// Create the note with file
				const reqData: CreateNoteDto = {
					title: 'Science Lecture 5',
					shortDescription:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada vitae metus nec lobortis.',
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
				expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toMatch('Validation error')
			})

			it('should throw a validation error if shortDescription is longer than 120 characters', async () => {
				// Create the note with file
				const reqData: CreateNoteDto = {
					title: 'Science Lecture 5',
					shortDescription:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada vitae metus nec lobortis. Mauris eget enim felis. Felis',
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
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toBeInstanceOf(Array)
				expect(res.body.message[0]).toMatch('Short description must be less than 120 characters long')
			})

			it('should fail to create a new note if a file is not provided', async () => {
				const reqData = {
					title: 'Science 101',
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[0].id
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
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
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

			it('should delete the note file if encounters a problem with note publish', async () => {
				const reqData: CreateNoteDto = {
					title: 'Science 101',
					shortDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada',
					fileUri: resBadFileUri,
					keywords: [ 'biology', 'chemestry', 'Physics' ],
					classId: testClasses[3].id // PROBLEM: Use classId which test user is not a member of
				}

				// Create actual note with file
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)
				const badFileExists = await testRemoteFileExists(resBadFileUri)

				// Verify results
				expect(res.status).toBe(HttpStatus.FORBIDDEN)
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toMatch('not in a class')
				expect(badFileExists).toBeFalsy()
			})
		})

		/** NOTE RATING FUNCTION TESTING */
		describe('Note Rating Functionality', () => {
			it('should allow the user to add a rating to the note', async () => {
				const reqData: RateNoteDto = {
					value: 4
				}

				// Rate the note
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}/by-id/${noteId}/rate`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body.id).toBe(noteId)
			})

			it('should disallow ratings of greater than 5', async () => {
				const reqData: RateNoteDto = {
					value: 8
				}

				// Rate the note
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}/by-id/${noteId}/rate`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body.message).toBeDefined()
			})

			it('should disallow ratings of less than 1', async () => {
				const reqData: RateNoteDto = {
					value: 0
				}

				// Rate the note
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}/by-id/${noteId}/rate`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body.message).toBeDefined()
			})

			it('should replace existing an existing rating on the same note if one already exists', async () => {
				const reqData: RateNoteDto[] = [ { value: 2 }, { value: 1 } ]

				// Rate the note (first time to value of 2)
				await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}/by-id/${noteId}/rate`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData[0])

				// Rate the note (second time to value of 1 ... this is what should persist after)
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}/by-id/${noteId}/rate`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData[0])

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.ratings).toBeDefined()
			})

			it('should get the average rating for the note by querying the note /ratings', async () => {
				// Query the average note rating
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/by-id/${noteId}/rating`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.value).toBeLessThanOrEqual(5)
				expect(res.body.value).toBeGreaterThanOrEqual(1)
			})
		})

		describe('Note Querying', () => {
			beforeAll(async () => {
				/**
				 * 
				 * This function will eliminate the need to logstash to perform index synchronization for the purposes of the e2e tests
				 * It does this by manually populating the index with some test data which only contains the real note ID using the ES API
				 * 
				 * TEST DATA:
				 * 
				 * notes: [
				 * 	{
				 *     id: noteId,
				 *     title: Science 101,
				 *     keywords: [ 'science', 'how-to' ],
				 *     shortDescription: 'A note all about the science of biology and stuff'
				 *  }
				 * ]
				 * 
				 * Neptune will use ES to search based on the combined data provided (includes all fields, title, keywords, short description...)
				 */
				await populateESIndexForTest(noteId)

				// Add a note that is in a class the user is not a part of so that we can ensure ES search filtering
				await connection.query(
					`INSERT INTO notes (id, time_length, title, keywords, short_description, note_abstract, note_c_d_n, file_uri, class_id, author_id, created_at, updated_at) VALUES (${testNoteIds[0]},5,'Science 205','{science,row}','biology','biology absract', 'https://badcdn.ca', 'fake.pdf',(SELECT id FROM classrooms WHERE id='${testClasses[0]
						.id}'),(SELECT id FROM users WHERE email='${TEST_USERNAME}'), '2021-01-01', '2021-01-01')`,
					{ logging: false }
				)
			})

			it('should find a single note by ID', async () => {
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/by-id/${noteId}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.title).toBeDefined()
			})

			it('should include a user (author) in note response objects', async () => {
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/by-id/${noteId}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.user).toBeDefined()
				expect(res.body.user.firstName.length).toBeGreaterThan(0)
			})

			it('should respond with not found if invalid id is passed', async () => {
				const res = await request(app.getHttpServer())
					.get(`${NOTE_BASE_URL}/by-id/999999`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
				expect(res.body.title).toBeUndefined()
			})

			it('should not find a note using using elasticsearch on /search with random garbage', async () => {
				const reqData: SearchNoteDto = {
					queryType: 'query_string',
					query: {
						query: 'randaopwdiuahwda 76dta67wt d6aw'
					},
					classId: testClasses[0].id
				}

				// Perform the search
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}/search`)
					.send(reqData)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.NOT_FOUND)
				expect(res.body).not.toBeUndefined()
			})

			it('should find a note using elasticsearch on /search with valid query', async () => {
				const reqData: SearchNoteDto = {
					queryType: 'query_string',
					query: {
						query: 'science and biology how-to'
					},
					classId: testClasses[0].id
				}

				// Perform the search
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}/search`)
					.send(reqData)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThanOrEqual(1)
				expect(res.body[0].title).toMatch('Science 101')
				expect(res.body[0].user).toBeDefined()
				expect(res.body[0].user.firstName.length).toBeGreaterThan(0)
				expect(res.body.filter((note) => note.id === testNoteIds[0]).length).toEqual(0)
			})

			it('should find a note using elasticsearch on /search with only a word from the description field', async () => {
				const reqData: SearchNoteDto = {
					queryType: 'query_string',
					query: {
						query: 'biology stuff'
					},
					classId: testClasses[0].id
				}

				// Perform the search
				const res = await request(app.getHttpServer())
					.post(`${NOTE_BASE_URL}/search`)
					.send(reqData)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Array)
				expect(res.body.length).toBeGreaterThanOrEqual(1)
				expect(res.body[0].title).toMatch('Science 101')
				expect(res.body[0].user).toBeDefined()
				expect(res.body[0].user.firstName.length).toBeGreaterThan(0)
				expect(res.body.filter((note) => note.id === testNoteIds[0]).length).toEqual(0)
			})

			afterAll(async () => {
				// Remove note used in the test
				await connection.query(`DELETE FROM notes where id=${testNoteIds[0]}`)
			})
		})

		describe('Note Update and Delete', () => {
			beforeAll(async () => {
				await populateESIndexForTest(noteId)
			})

			it('should update a note with given id with set of acceptable fields', async () => {
				const reqData = {
					noteId: noteId,
					data: {
						title: 'ABC Note'
					}
				}

				// Perform update to title of the note
				const res = await request(app.getHttpServer())
					.put(`${NOTE_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body.title).toMatch(reqData.data.title)

				// Verify the modifying author is returned with the response
				expect(res.body.user).toBeDefined()
				expect(res.body.user.firstName.length).toBeGreaterThan(0)
			})

			it('should fail to update without authorization of author', async () => {
				const reqData = {
					noteId: noteId,
					data: {
						title: 'Good Title'
					}
				}

				// Attempt unauthorized update title
				const res = await request(app.getHttpServer()).put(`${NOTE_BASE_URL}`).send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
			})

			it('should fail to delete note with fake id', async () => {
				const badRequestData: DeleteNoteDto = {
					noteId: 9999999
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
					noteId
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

		afterAll(async () => {
			await connection.query(`DELETE FROM classrooms_users`, {
				logging: false
			})
		})
	})

	describe('Classroom Controller', () => {
		const CLASSROOM_BASE_URL = '/classrooms'
		describe('Classroom Queries', () => {
			beforeAll(async () => {
				// Join the test user to the first test classroom
				await connection.query(
					`INSERT INTO classrooms_users (class_id, user_id, created_at, updated_at) VALUES ((SELECT id FROM classrooms WHERE id='${testClasses[0]
						.id}'), (SELECT id FROM users WHERE email='${TEST_USERNAME}'), '2021-01-01', '2021-01-01')`,
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
				expect(res.body[0].user).toBeDefined()
				expect(res.body[0].user.firstName.length).toBeGreaterThan(0)
			})
		})
		describe('Classroom CRUD', () => {
			let testClassID: string

			it('should create and return the created classroom that is owned by the requesting user', async () => {
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
			})

			it('should create a classroom with a custom thumbnail image', async () => {
				const reqData: CreateClassroomDto = {
					name: 'ABC Classroom',
					thumbnailUri: resGoodImageUri
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
				expect(res.body.thumbnailUri).toMatch(reqData.thumbnailUri)
			})

			it('should create a classroom with a default thumbnail if one is not specified', async () => {
				const reqData: CreateClassroomDto = {
					name: 'HTY Classroom'
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
				expect(res.body.thumbnailUri).toBeDefined()
				expect(res.body.thumbnailUri).toMatch(config.classThumbnailDefaultURI)
			})

			it('should throw BAD_REQUEST when supplied an empty name for the class', async () => {
				const reqData: CreateClassroomDto = {
					name: ''
				}

				// Make the request to create classroom
				const res = await request(app.getHttpServer())
					.post(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message).toBeInstanceOf(Array)
				expect(res.body.message[0]).toMatch('Name must be at least 5 characters long')
			})

			it('should throw validation error when name is too long (more than 25 characters)', async () => {
				const reqData: CreateClassroomDto = {
					name: 'Classroom names should less than 25 characters'
				}

				// Make the request to create classroom
				const res = await request(app.getHttpServer())
					.post(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Verify results
				expect(res.status).toBe(HttpStatus.BAD_REQUEST)
				expect(res.body).toBeDefined()
				expect(res.body.message).toBeDefined()
				expect(res.body.message[0]).toMatch('Name must not be more than 25 characters long')
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
				/**
				 * Create a note inside of the classroom which should be deleted when the classroom is deleted
				 */
				await connection.query(
					`INSERT INTO notes (id, time_length, title, keywords, short_description, note_abstract, note_c_d_n, file_uri, class_id, author_id, created_at, updated_at) VALUES (${testNoteIds[0]},5,'Science 205','{science,row}','biology','biology absract', 'https://badcdn.ca', 'fake.pdf',(SELECT id FROM classrooms WHERE id='${testClassID}'),(SELECT id FROM users WHERE email='${TEST_USERNAME}'), '2021-01-01', '2021-01-01')`,
					{ logging: false }
				)

				const reqData: DeleteClassroomDto = {
					classId: testClassID
				}

				// Perform delete
				const res = await request(app.getHttpServer())
					.delete(`${CLASSROOM_BASE_URL}`)
					.set('Authorization', `Bearer ${jwtToken}`)
					.send(reqData)

				// Validate that the thumbnail was deleted
				const thumbExists = await testRemoteFileExists(resGoodImageUri)

				// Check if notes were deleted that belonged to classroom
				const noteCountRes = await connection.query(`SELECT COUNT(*) FROM notes WHERE class_id='${testClassID}'`, {
					logging: false
				})

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body.message).toMatch(`${testClassID}`)
				expect(thumbExists).toBeFalsy()
				expect(parseInt(noteCountRes.values().next().value[0]['count'])).toBe(0) // Ensures all notes within are deleted as well
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
				expect(res.body[0].user).toBeDefined()
				expect(res.body[0].user.firstName.length).toBeGreaterThan(0)
			})
		})

		describe('User Classroom Operations', () => {
			it('should join user to a classroom', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/join/${testClasses[3].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[3].id}`)
			})

			it('should allow the user to join multiple classrooms', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/join/${testClasses[1].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[1].id}`)
			})

			it('should remove user from classroom when requested to leave', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/leave/${testClasses[1].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Get classroom (if exists)
				const classrooms = await connection.query(`SELECT * FROM classrooms WHERE id='${testClasses[1]}'`, {
					model: Classroom,
					mapToModel: true,
					logging: false
				})

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[1].id}`)
				expect(classrooms.length === 1) // Ensures that if the user is **NOT** the owner of the class, the classroom is not destroyed
			})

			it('should delete classroom when owner leaves the classroom', async () => {
				const res = await request(app.getHttpServer())
					.post(`${USER_BASE_URL}/classroom/leave/${testClasses[3].id}`)
					.set('Authorization', `Bearer ${jwtToken}`)

				// Get classroom (if exists)
				const classrooms = await connection.query(`SELECT * FROM classrooms WHERE id='${testClasses[3]}'`, {
					model: Classroom,
					mapToModel: true,
					logging: false
				})

				// Verify results
				expect(res.status).toBe(HttpStatus.OK)
				expect(res.body).toBeDefined()
				expect(res.body).toBeInstanceOf(Object)
				expect(res.body.message).toMatch(`${testClasses[3].id}`)
				expect(classrooms.length === 0) // Ensures classroom is destroyed if the owner leaves
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

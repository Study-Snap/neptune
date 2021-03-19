import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test, TestingModule } from '@nestjs/testing'
import { Sequelize } from 'sequelize'
import { AppModule } from '../src/app.module'
import * as request from 'supertest'
import { createTestAccountForE2e, getAccessTokenFromAuth, TEST_PASSWORD, TEST_USERNAME } from './util'

describe('Neptune', () => {
	let app: INestApplication
	let connection: Sequelize

	// For use in testing prodected endpoints
	let jwtToken: string

	// Setup test environment
	beforeAll(async () => {
		const testModule: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		}).compile()

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

	describe('NotesController', () => {
		const NOTE_BASE_URL = '/api/notes'

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
			it('should create a new note with valid inputs', async () => {
				// TODO
			})

			it('should fail to create a new note if a file is not provided', async () => {
				// TODO
			})

			// TODO: To be continued...
		})
	})

	afterAll(async () => {
		// Close server
		await app.close()

		// Close db connections
		await connection.close()
	})
})

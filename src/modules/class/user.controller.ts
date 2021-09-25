import { Controller, Get, HttpCode, HttpStatus, Param, Post, Request } from '@nestjs/common'
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { Note } from '../notes/models/notes.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { ClassLeaveJoinResponseType } from './types/class-leave-join-resp.type'
import { UserService } from './user.service'

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/** USER DATA FUNCTIONS */

	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
		description: 'The current logged in users data object (excludes password field for obvious reasons)'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get()
	async getUserData(@Request() req): Promise<User> {
		return this.userService.getUserWithID(req.user.id)
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
		description: 'The current logged in users notes that they have uploaded'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('notes')
	async getUploadedNotes(@Request() req): Promise<Note[]> {
		// gets a list of notes uploaded by the user
		return this.userService.getUserNotes(req.user.id)
	}

	@ApiParam({
		name: 'id',
		description: 'A unique UID that identifies the user',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
		description: 'The looked up users data response object'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@Get('by-id/:id')
	async getUserWithId(@Param('id') id: number): Promise<User> {
		return this.userService.getUserWithID(id)
	}

	@ApiParam({
		name: 'id',
		description: 'A unique UID that identifies the user',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Classroom,
		isArray: true,
		description: 'A list of classrooms that the selected user is a part of'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-id/:id/classrooms')
	async getClassroomsForUser(@Request() req, @Param('id') id: number): Promise<Classroom[]> {
		// gets classrooms for a user by lookup
		return this.userService.getUserClassrooms(id)
	}

	@ApiParam({
		name: 'id',
		description: 'A unique UID that identifies the user',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
		description: 'A list of notes that the user has uploaded to studysnap'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-id/:id/notes')
	async getNotesForUser(@Request() req, @Param('id') id: number): Promise<Note[]> {
		// gets a list of notes uploaded by the user
		return this.userService.getUserNotes(id)
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: Classroom,
		isArray: true,
		description: 'A list of classrooms that the currently logged in user is a member of'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('classrooms')
	async getClassroomsForSelf(@Request() req): Promise<Classroom[]> {
		// Gets classrooms for the requesting user
		return this.userService.getUserClassrooms(req.user.id)
	}

	/** CLASSROOM JOIN/LEAVE FUNCTIONS FOR THE USER (logged-in) */

	@ApiParam({
		name: 'classId',
		description: 'A unique UUID for a classroom to join the currently logged in user to',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: ClassLeaveJoinResponseType,
		description: 'A status object that confirms success or failure of joining the selected classroom'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@HttpCode(200)
	@Post('classroom/join/:classId')
	async joinClassroom(@Request() req, @Param('classId') classId: string): Promise<object> {
		await this.userService.joinClassroom(req.user.id, classId)
		return {
			statusCode: 200,
			message: `Successfully joined classroom with ID ${classId}`
		}
	}

	@ApiParam({
		name: 'classId',
		description: 'A unique UUID for a classroom to join the currently logged in user to',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: ClassLeaveJoinResponseType,
		description: 'A status object that confirms success or failure of joining the selected classroom'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@HttpCode(200)
	@Post('classroom/leave/:classId')
	async leaveClassroom(@Request() req, @Param('classId') classId: string): Promise<object> {
		await this.userService.leaveClassroom(req.user.id, classId)
		return {
			statusCode: 200,
			message: `Successfully left classroom with ID ${classId}`
		}
	}
}

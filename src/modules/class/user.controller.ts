import { Controller, Get, Param, Post, Request } from '@nestjs/common'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/** USER DATA FUNCTIONS */

	@JwtAuth()
	@Get()
	async getUserData(@Request() req): Promise<User> {
		return this.userService.getUserWithID(req.user.id)
	}

	@Get('by-uuid/:id')
	async getUserWithId(@Param('id') id: number): Promise<User> {
		return this.userService.getUserWithID(id)
	}

	@JwtAuth()
	@Get('by-uuid/:id/classrooms')
	async getClassroomsForUser(@Request() req, @Param('id') id: number): Promise<Classroom[]> {
		// gets classrooms for a user by lookup
		return this.userService.getUserClassrooms(id)
	}

	@JwtAuth()
	@Get('classrooms')
	async getClassroomsForSelf(@Request() req): Promise<Classroom[]> {
		// Gets classrooms for the requesting user
		return this.userService.getUserClassrooms(req.user.id)
	}

	/** CLASSROOM JOIN/LEAVE FUNCTIONS FOR THE USER (logged-in) */

	@JwtAuth()
	@Post('classroom/join/:classId')
	async joinClassroom(@Request() req, @Param('classId') classId: string): Promise<object> {
		await this.userService.joinClassroom(req.user.id, classId)
		return {
			statusCode: 200,
			message: `Successfully joined classroom with ID ${classId}`
		}
	}

	@JwtAuth()
	@Post('classroom/leave/:classId')
	async leaveClassroom(@Request() req, @Param('classId') classId: string): Promise<object> {
		await this.userService.leaveClassroom(req.user.id, classId)
		return {
			statusCode: 200,
			message: `Successfully left classroom with ID ${classId}`
		}
	}
}

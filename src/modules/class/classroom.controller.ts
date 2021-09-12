import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Request } from '@nestjs/common'
import { JwtAuth } from 'src/common/decorators/jwt-auth.decorator'
import { Note } from '../notes/models/notes.model'
import { ClassroomService } from './classroom.service'
import { CreateClassroomDto } from './dto/create-classroom.dto'
import { DeleteClassroomDto } from './dto/delete-classroom.dto'
import { UpdateClassroomDto } from './dto/update-classroom.dto'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'

@Controller('classrooms')
export class ClassroomController {
	constructor(private readonly classroomService: ClassroomService) {}

	@Get()
	async listClassrooms(): Promise<Classroom[]> {
		return this.classroomService.getAvailableClassrooms()
	}

	@Get('by-uuid/:id')
	async getClassroom(@Param('id') id: string): Promise<Classroom> {
		return this.classroomService.getClassroomWithID(id)
	}

	@JwtAuth()
	@Get('by-uuid/:id/users')
	async getClassroomUsers(@Request() req, @Param('id') id: string): Promise<User[]> {
		return this.classroomService.getClassroomUsers(id, req.user.id)
	}

	@JwtAuth()
	@Get('by-uuid/:id/notes')
	async getClassroomNotes(@Request() req, @Param('id') id: string): Promise<Note[]> {
		return this.classroomService.getClassroomNotes(id, req.user.id)
	}

	@JwtAuth()
	@Post()
	async createClassroom(@Request() req, @Body() createCrDto: CreateClassroomDto): Promise<Classroom> {
		return this.classroomService.createClassroom(createCrDto.name, req.user.id)
	}

	@JwtAuth()
	@Put()
	async updateClassroom(@Request() req, @Body() updateCrDto: UpdateClassroomDto): Promise<Classroom> {
		return this.classroomService.updateClassroom(updateCrDto.classId, req.user.id, updateCrDto.data)
	}

	@JwtAuth()
	@Delete()
	async deleteClassroom(@Request() req, @Body() deleteCrDto: DeleteClassroomDto): Promise<object> {
		const crDeleted = await this.classroomService.deleteClassroom(deleteCrDto.classId, req.user.id)

		if (!crDeleted) {
			throw new InternalServerErrorException(`Could not delete Classroom with ID ${deleteCrDto.classId}`)
		}

		return {
			statusCode: 200,
			message: `Successfully delete classroom with id, ${deleteCrDto.classId}`
		}
	}
}

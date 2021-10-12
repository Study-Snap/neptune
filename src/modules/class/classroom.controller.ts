import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	InternalServerErrorException,
	Param,
	Post,
	Put,
	Request
} from '@nestjs/common'
import { ApiBody, ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { Note } from '../notes/models/notes.model'
import { ClassroomService } from './classroom.service'
import { CreateClassroomDto } from './dto/create-classroom.dto'
import { DeleteClassroomDto } from './dto/delete-classroom.dto'
import { UpdateClassroomDto } from './dto/update-classroom.dto'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { ClassDeleteResponseType } from './types/class-delete-resp.type'

@ApiTags('classrooms')
@Controller('classrooms')
export class ClassroomController {
	constructor(private readonly classroomService: ClassroomService) {}

	@ApiResponse({
		status: HttpStatus.OK,
		type: Classroom,
		isArray: true,
		description: 'A list of classrooms that are available for all to join'
	})
	@Get()
	async listClassrooms(): Promise<Classroom[]> {
		return this.classroomService.getAvailableClassrooms()
	}

	@ApiParam({
		name: 'id',
		description: 'a unique UUID that identifies the classroom for which you want to get data from'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Classroom,
		description: 'A single classroom object containing information about the classroom'
	})
	@Get('by-uuid/:id')
	async getClassroom(@Param('id') id: string): Promise<Classroom> {
		return this.classroomService.getClassroomWithID(id)
	}

	@ApiParam({
		name: 'id',
		description: 'a unique UUID that identifies the classroom for which you want to get data from'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: User,
		isArray: true,
		description: 'A list of user objects '
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-uuid/:id/users')
	async getClassroomUsers(@Request() req, @Param('id') id: string): Promise<User[]> {
		return this.classroomService.getClassroomUsers(id, req.user.id)
	}

	@ApiParam({
		name: 'id',
		description: 'a unique UUID that identifies the classroom for which you want to get data from'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
		description: 'A list of note objects that match the id passed in as parameter'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-uuid/:id/notes')
	async getClassroomNotes(@Request() req, @Param('id') id: string): Promise<Note[]> {
		return this.classroomService.getClassroomNotes(id, req.user.id)
	}

	@ApiParam({
		name: 'id',
		description: 'a unique UUID that identifies the classroom for which you want to get data from'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
		description: 'A list of the top rated Note objects in the classroom'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-uuid/:id/notes/top')
	async getTopClassroomNotes(@Request() req, @Param('id') id: string): Promise<Note[]> {
		return this.classroomService.getTopClassroomNotesByRating(req.user.id, id)
	}

	@ApiBody({
		type: CreateClassroomDto,
		description: 'Describe the classroom to be created',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		type: Classroom,
		description: 'The created classroom object'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Post()
	async createClassroom(@Request() req, @Body() createCrDto: CreateClassroomDto): Promise<Classroom> {
		return this.classroomService.createClassroom(createCrDto.name, req.user.id, createCrDto.thumbnailUri)
	}

	@ApiBody({
		type: UpdateClassroomDto,
		description: 'Describes the classroom and changes to make to the data object',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Classroom,
		description: 'The updated classroom object'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Put()
	async updateClassroom(@Request() req, @Body() updateCrDto: UpdateClassroomDto): Promise<Classroom> {
		return this.classroomService.updateClassroom(updateCrDto.classId, req.user.id, updateCrDto.data)
	}

	@ApiBody({
		type: DeleteClassroomDto,
		description: 'Describes the classroom to delete',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: ClassDeleteResponseType,
		description: 'The updated classroom object'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
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

import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	InternalServerErrorException,
	Param,
	Post,
	Put,
	Request
} from '@nestjs/common'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { CreateNoteDto } from './dto/create-note.dto'
import { Note } from './models/notes.model'
import { NotesService } from './notes.service'
import { UpdateNoteDto } from './dto/update-note.dto'
import { DeleteNoteDto } from './dto/delete-note.dto'
import { SearchNoteDto } from './dto/search-note.dto'
import { ApiBody, ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { TestResponseType } from './types/test-auth.type'
import { NoteDeleteResponseType } from './types/note-delete-response.type'

@ApiTags('notes')
@Controller('notes')
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@ApiResponse({
		status: HttpStatus.OK,
		type: TestResponseType,
		description: 'Shows the decoded JWT access token (if valid)'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('test')
	async testEndpoint(@Request() req) {
		return {
			statusCode: 200,
			message: 'Authenticated Request Successful!',
			user: req.user
		}
	}

	@ApiParam({
		name: 'id',
		description: 'A unique id that identifies a note',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		description: 'A note object that contains data about the note'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Get('by-id/:id')
	async getNote(@Request() req, @Param('id') id: number): Promise<Note> {
		return this.notesService.getNoteWithID(id, req.user.id)
	}

	@ApiBody({
		type: SearchNoteDto,
		description: 'A set of query parameters that help to define the search for ElasticSearch',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		isArray: true,
		description: 'A list of note objects that contains data about notes that turn up in the elasticsearch results'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@HttpCode(200)
	@Post('search')
	async getNotesForQuery(@Request() req, @Body() searchDto: SearchNoteDto): Promise<Note[]> {
		return this.notesService.getNotesUsingES(req.user.id, searchDto.queryType, searchDto.query, searchDto.classId)
	}

	@ApiBody({
		type: CreateNoteDto,
		description: 'A set of all fields required to create a note',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		type: Note,
		description: 'A note object that contains data about the newly created note'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Post()
	async createNote(@Request() req, @Body() createDto: CreateNoteDto): Promise<Note> {
		const authorId = req.user.id

		// Create the note in the notes database with file reference
		return this.notesService.createNoteWithFile(createDto, authorId)
	}

	@ApiBody({
		type: UpdateNoteDto,
		description: 'A note ID and a set of key:value pairs to update for the selected note',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: Note,
		description: 'A note object that contains data about the note'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Put()
	async updateNoteWithID(@Request() req, @Body() updateDto: UpdateNoteDto): Promise<Note> {
		return this.notesService.updateNoteWithID(req.user.id, updateDto.noteId, updateDto.newData)
	}

	@ApiBody({
		type: DeleteNoteDto,
		description:
			'Required ID of the note and additionally the option specification of a file (if multiple) to delete along with the note',
		required: true
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: NoteDeleteResponseType,
		description: 'A status object that specifies success or failure status of the delete operation for the note'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@Delete()
	async deleteNoteWithID(@Request() req, @Body() deleteDto: DeleteNoteDto): Promise<object> {
		const resNote = await this.notesService.deleteNoteWithID(req.user.id, deleteDto.noteId, deleteDto.fileUri)

		if (!resNote) {
			throw new InternalServerErrorException(`Could not delete note with ID ${deleteDto.noteId}`)
		}

		return {
			statusCode: 200,
			message: `Successfully delete note with id, ${deleteDto.noteId}`
		}
	}
}

import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	Post,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { CreateNoteDto } from './dto/create-note.dto'
import { Note } from './models/notes.model'
import { NotesService } from './notes.service'
import { v4 as uuid } from 'uuid'
import { IFileWithId } from 'src/common/interfaces/common'

@Controller('/api/notes')
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@JwtAuth()
	@Get('test')
	async tessEndpoint(@Request() req) {
		return {
			status: 'success',
			message: 'Authenticated Request Successful!',
			user: req.user
		}
	}

	@Get(':id')
	async getNote(@Param('id') id): Promise<Note> {
		return this.notesService.getNoteWithId(id)
	}

	@JwtAuth()
	@UseInterceptors(FileInterceptor('file'))
	@Post()
	async createNote(
		@Request() req,
		@UploadedFile() file: Express.Multer.File,
		@Body() createDto: CreateNoteDto
	): Promise<Note> {
		if (!file) {
			throw new BadRequestException('You must include a file to create a note.')
		}

		// TODO: Fix file and body at same time issue
		const authorId = req.user.id
		const fileWithId: IFileWithId = { id: uuid(), data: file }

		// Create the note
		return this.notesService.createNoteWithFile(createDto, fileWithId, authorId, 5)
	}
}

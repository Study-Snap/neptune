import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { CreateNoteDto } from './dto/create-note.dto'
import { Note } from './models/notes.model'
import { NotesService } from './notes.service'
import { diskStorage } from 'multer'
import { editFileName } from './helper'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { UpdateNoteDto } from './dto/update-note.dto'
import { FilesService } from '../files/files.service'

const config: IConfigAttributes = getConfig()

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
	async getNote(@Param('id') id: number): Promise<Note> {
		return this.notesService.getNoteWithId(id)
	}

	@Get('/all/:title')
	async getNotesWithTitle(@Param('title') title: string): Promise<Note[]> {
		return this.notesService.getNotesWithTitle(title)
	}

	@JwtAuth()
	@Post()
	async createNote(@Request() req, @Body() createDto: CreateNoteDto): Promise<Note> {
		const authorId = req.user.id

		// Create the note in the notes database with file reference
		return this.notesService.createNoteWithFile(createDto, authorId, 5)
	}

	@JwtAuth()
	@Put()
	async updateNoteWithId(@Request() req, @Body() updateDto: UpdateNoteDto): Promise<Note> {
		return this.notesService.updateNoteWithId(req.user.id, updateDto.noteId, updateDto.newData)
	}

	@JwtAuth()
	@Delete(':id')
	async deleteNoteWithId(
		@Request() req,
		@Param('id') id: number,
		@Query('typeOverride') type?: string
	): Promise<object> {
		const resNote = await this.notesService.deleteNoteWithId(req.user.id, id, type ? type : 'pdf')

		const response = {
			statusCode: 200,
			message: resNote ? `Successfully delete note with id, ${id}` : `Could not delete the note with id, ${id}`
		}

		return response
	}
}

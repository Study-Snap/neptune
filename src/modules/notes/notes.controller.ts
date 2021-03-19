import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
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
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from 'src/config'
import { UpdateNoteDto } from './dto/update-note.dto'

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
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: config.fileStorageLocation,
				filename: editFileName
			})
		})
	)
	@Post('file')
	async createNoteFile(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<object> {
		if (!file) {
			throw new BadRequestException('You must include a file')
		}

		// Return the uploaded file ID and type
		return {
			statusCode: 201,
			fileId: file.filename.split('.')[0],
			fileType: file.filename.split('.')[1],
			message: 'File was successfully uploaded to cloud storage'
		}
	}

	@JwtAuth()
	@Put()
	async updateNoteWithId(@Request() req, @Body() updateDto: UpdateNoteDto): Promise<Note> {
		return this.notesService.updateNoteWithId(req.user.id, updateDto.noteId, updateDto.newData)
	}

	@JwtAuth()
	@Delete(':id')
	async deleteNoteWithId(@Request() req, @Param('id') id: number): Promise<object> {
		const res = await this.notesService.deleteNoteWithId(req.user.id, id)
		const response = {
			statusCode: 200,
			message: res ? `Successfully delete note with id, ${id}` : `Could not delete the note with id, ${id}`
		}

		return response
	}
}

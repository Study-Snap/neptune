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
import { diskStorage } from 'multer'
import { editFileName } from './helper'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from 'src/config'

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
	async getNote(@Param('id') id): Promise<Note> {
		return this.notesService.getNoteWithId(id)
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
	async createNoteFile(@Request() req: Express.Request, @UploadedFile() file: Express.Multer.File): Promise<object> {
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
}

import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { CreateNoteDto } from './dto/create-note.dto'
import { Note } from './models/notes.model'
import { NotesService } from './notes.service'
import { UpdateNoteDto } from './dto/update-note.dto'
import { DeleteNoteDto } from './dto/delete-note.dto'

@Controller('neptune/notes')
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
	@Delete()
	async deleteNoteWithId(@Request() req, @Body() deleteDto: DeleteNoteDto): Promise<object> {
		const resNote = await this.notesService.deleteNoteWithId(req.user.id, deleteDto.noteId, deleteDto.fileUri)

		const response = {
			statusCode: 200,
			message: resNote
				? `Successfully delete note with id, ${deleteDto.noteId}`
				: `Could not delete the note with id, ${deleteDto.noteId}`
		}

		return response
	}
}

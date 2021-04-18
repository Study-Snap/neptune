import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { CreateNoteDto } from './dto/create-note.dto'
import { Note } from './models/notes.model'
import { NotesService } from './notes.service'
import { UpdateNoteDto } from './dto/update-note.dto'
import { DeleteNoteDto } from './dto/delete-note.dto'
import { SearchNoteDto } from './dto/search-note.dto'

@Controller('neptune/notes')
export class NotesController {
	constructor(private readonly notesService: NotesService) {}

	@JwtAuth()
	@Get('test')
	async testEndpoint(@Request() req) {
		return {
			status: 'success',
			message: 'Authenticated Request Successful!',
			user: req.user
		}
	}

	@Get('all')
	async getAllNotesTemp(): Promise<Note[]> {
		return this.notesService.getAllNotes()
	}

	@Get('top')
	async getTopNotesByRating(): Promise<Note[]> {
		return this.notesService.getTopNotesByRating()
	}

	@Get(':id')
	async getNote(@Param('id') id: number): Promise<Note> {
		return this.notesService.getNoteWithId(id)
	}

	@Post('search')
	async getNotesForQuery(@Body() searchDto: SearchNoteDto): Promise<Note[]> {
		return this.notesService.getNotesUsingES(searchDto.queryType, searchDto.query)
	}

	@JwtAuth()
	@Post()
	async createNote(@Request() req, @Body() createDto: CreateNoteDto): Promise<Note> {
		const authorId = req.user.id

		// Create the note in the notes database with file reference
		return this.notesService.createNoteWithFile(createDto, authorId)
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

import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject } from 'class-validator'
import { CreateNoteDto } from './create-note.dto'

export class UpdateNoteDto {
	@ApiProperty({ default: 5, required: true })
	@IsNumber()
	@IsNotEmpty({ message: 'Missing: "noteId". You must enter the ID of the note you wish to update.' })
	noteId: number

	@ApiProperty({ default: '{title: "Lecture 6"}', type: CreateNoteDto, required: true })
	@IsObject()
	@IsNotEmptyObject({ message: 'Missing: "newData". You must specify some data to change on the note.' })
	data: object
}

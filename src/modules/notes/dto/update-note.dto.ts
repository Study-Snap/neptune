import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject } from 'class-validator'

/**
 * Data transfer object specification for updating a note
 */
export class UpdateNoteDto {
	@ApiProperty({ default: 5, required: true })
	@IsNumber()
	@IsNotEmpty({ message: 'Missing: "noteId". You must enter the ID of the note you wish to update.' })
	noteId: number

	@ApiProperty({ default: '{title: "Lecture 6"}', required: true })
	@IsObject()
	@IsNotEmptyObject({ message: 'Missing: "newData". You must specify some data to change on the note.' })
	data: { title?: string; keywords?: string[]; shortDescription?: string; rating?: number[]; fileUri?: string }
}

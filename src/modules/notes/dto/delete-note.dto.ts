import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

/**
 * Data transfer object specification for deleting a note
 */
export class DeleteNoteDto {
	@ApiProperty({ default: 5, required: true })
	@IsNumber()
	@IsNotEmpty({ message: 'Must specify the noteId for the note to be deleted' })
	noteId: number
}

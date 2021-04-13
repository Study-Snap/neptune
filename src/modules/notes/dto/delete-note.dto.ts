import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class DeleteNoteDto {
	@IsNumber()
	@IsNotEmpty({ message: 'Must specify the noteId for the note to be deleted' })
	noteId: number

	@IsOptional()
	@IsString()
	fileUri?: string
}

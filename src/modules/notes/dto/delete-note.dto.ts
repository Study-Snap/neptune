import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class DeleteNoteDto {
	@IsNumber()
	@IsNotEmpty({ message: 'Must specify the noteId for the note to be deleted' })
	noteId: number

	@IsString()
	@IsString()
	@IsNotEmpty({ message: 'You must specify an associated fileUri for this note' })
	fileUri: string
}

import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject } from 'class-validator'

export class UpdateNoteDto {
	@IsNumber()
	@IsNotEmpty({ message: 'Missing: "noteId". You must enter the ID of the note you wish to update.' })
	noteId: number

	@IsObject()
	@IsNotEmptyObject({ message: 'Missing: "newData". You must specify some data to change on the note.' })
	newData: object
}

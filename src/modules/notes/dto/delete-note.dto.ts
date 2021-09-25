import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class DeleteNoteDto {
	@ApiProperty({ default: 5, required: true })
	@IsNumber()
	@IsNotEmpty({ message: 'Must specify the noteId for the note to be deleted' })
	noteId: number

	@ApiProperty({ default: 'attachement-182489124-24-12412-44.pdf', required: false })
	@IsOptional()
	@IsString()
	fileUri?: string
}

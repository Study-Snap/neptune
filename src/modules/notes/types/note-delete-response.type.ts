import { ApiProperty } from '@nestjs/swagger'

export class NoteDeleteResponseType {
	@ApiProperty() statusCode: number
	@ApiProperty() message: string
}

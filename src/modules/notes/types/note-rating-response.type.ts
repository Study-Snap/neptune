import { ApiProperty } from '@nestjs/swagger'

export class NoteRatingResponse {
	@ApiProperty() statusCode: number
	@ApiProperty() value: number
}

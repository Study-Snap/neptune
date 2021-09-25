import { ApiProperty } from '@nestjs/swagger'

export class FileCreateResponseType {
	@ApiProperty() statusCode: number
	@ApiProperty() fileUri: string
	@ApiProperty() message: string
}

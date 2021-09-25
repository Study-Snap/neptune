import { ApiProperty } from '@nestjs/swagger'

export class TestResponseType {
	@ApiProperty() statusCode: number
	@ApiProperty() message: string
	@ApiProperty() user: Object
}

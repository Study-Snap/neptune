import { ApiProperty } from '@nestjs/swagger'

export class ClassDeleteResponseType {
	@ApiProperty() statusCode: number
	@ApiProperty() message: string
}

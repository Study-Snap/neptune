import { ApiProperty } from '@nestjs/swagger'

export class ClassLeaveJoinResponseType {
	@ApiProperty() statusCode: number
	@ApiProperty() message: string
}

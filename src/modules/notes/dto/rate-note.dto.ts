import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export class RateNoteDto {
	@ApiProperty({ default: 4, type: RateNoteDto, required: true })
	@IsNumber({ allowNaN: false })
	@Min(1, { message: 'Value must be at least 1' })
	@Max(5, { message: 'Value must be 5 or less' })
	value: number
}

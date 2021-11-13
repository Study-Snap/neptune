import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateClassroomDto {
	@ApiProperty({ default: 'Science 100', required: true })
	@IsString({ message: 'Must include a name for the classroom' })
	@MinLength(5, { message: 'Name must be at least 5 characters long' })
	@MaxLength(25, { message: 'Name must not be more than 25 characters long' })
	name: string

	@ApiProperty({ default: 'classthumb.jpg', required: false })
	@IsOptional()
	thumbnailUri?: string
}

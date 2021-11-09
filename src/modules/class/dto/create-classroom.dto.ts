import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateClassroomDto {
	@ApiProperty({ default: 'Science 100', required: true })
	@IsString({ message: 'Must include a name for the classroom' })
	name: string

	@ApiProperty({ default: 'classthumb.jpg', required: false })
	@IsOptional()
	thumbnailUri?: string
}

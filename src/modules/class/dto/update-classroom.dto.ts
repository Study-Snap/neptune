import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, IsString } from 'class-validator'

export class UpdateClassroomDto {
	@ApiProperty({ default: '602A2DDE-A15C-4257-A9D8-4EBB501A7C2C', required: true })
	@IsString({ message: 'Must provide a classId to update' })
	classId: string

	@ApiProperty({ default: { name: 'History 101' }, required: true })
	@IsNotEmptyObject({ message: 'Must provide valid data object to update' })
	data: { name?: string; ownerId?: number; thumbnailUri?: string }
}

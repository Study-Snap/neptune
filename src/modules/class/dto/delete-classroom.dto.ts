import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

/**
 * The data transfer object for deleting a classroom
 */
export class DeleteClassroomDto {
	@ApiProperty({ default: '602A2DDE-A15C-4257-A9D8-4EBB501A7C2C', required: true })
	@IsString({ message: 'Must provide a classId to delete' })
	classId: string
}

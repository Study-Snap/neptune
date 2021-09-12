import { IsString } from 'class-validator'

export class DeleteClassroomDto {
	@IsString({ message: 'Must provide a classId to delete' })
	classId: string
}

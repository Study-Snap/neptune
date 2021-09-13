import { IsNotEmptyObject, IsString } from 'class-validator'

export class UpdateClassroomDto {
	@IsString({ message: 'Must provide a classId to update' })
	classId: string

	@IsNotEmptyObject({ message: 'Must provide valid data object to update' })
	data: { name?: string; ownerId?: number }
}

import { IsString } from 'class-validator'

export class CreateClassroomDto {
	@IsString({ message: 'Must include a name for the classroom' })
	name: string
}

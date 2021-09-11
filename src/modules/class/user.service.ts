import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ClassroomService } from './classroom.service'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
	constructor(private readonly userRepository: UserRepository, private readonly classroomService: ClassroomService) {}

	async getUserWithID(userId: number): Promise<User> {
		const user: User = await this.userRepository.get(userId)

		if (!user) {
			throw new NotFoundException(`Could not find a user with ID = ${userId}`)
		}

		return user
	}

	async getUserClassrooms(userId: number): Promise<Classroom[]> {
		const user: User = await this.getUserWithID(userId)
		if (!user.classes || user.classes.length === 0) {
			throw new NotFoundException(`No classes found for ${user.firstName}`)
		}

		return user.classes
	}

	async joinClassroom(userId: number, classId: string): Promise<void> {
		const user: User = await this.getUserWithID(userId)
		const res: ClassroomUser = await this.classroomService.addUserToClassroom(classId, user)

		if (!res) {
			throw new InternalServerErrorException(`Failed to join ${user.firstName} to classroom with ID, ${classId}`)
		}
	}

	async leaveClassroom(userId: number, classId: string): Promise<void> {
		const user: User = await this.getUserWithID(userId)
		const res: boolean = await this.classroomService.remUserFromClassroom(classId, user)

		if (!res) {
			throw new InternalServerErrorException(
				`Failed to remove user ${user.firstName} from classroom with ID, ${classId}`
			)
		}
	}
}

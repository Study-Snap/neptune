import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Note } from '../notes/models/notes.model'
import { ClassroomService } from './classroom.service'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserRepository } from './user.repository'

/**
 * Service functions for user operations
 */
@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		@Inject(forwardRef(() => ClassroomService))
		private readonly classroomService: ClassroomService
	) {}

	/**
	 * Gets user data for the provided user
	 * @param userId Unique ID for the user
	 * @returns A user object containing relevant user data
	 */
	async getUserWithID(userId: number): Promise<User> {
		const user: User = await this.userRepository.get(userId)

		if (!user) {
			throw new NotFoundException(`Could not find a user with ID = ${userId}`)
		}

		return user
	}

	/**
	 * Gets all classrooms the specified user with userId is a part of
	 * @param userId Unique id for the user
	 * @returns a list of all classrooms the user is a part of
	 */
	async getUserClassrooms(userId: number): Promise<Classroom[]> {
		const user: User = await this.getUserWithID(userId)
		const classes: Classroom[] = await this.userRepository.getClassrooms(userId)

		if (!classes || classes.length === 0) {
			throw new NotFoundException(`No classes found for ${user.firstName}`)
		}

		return classes
	}

	/**
	 * Gets a list of all notes owned by the specified user
	 * @param userId Unique ID for user
	 * @returns A list of notes that user owns
	 */
	async getUserNotes(userId: number): Promise<Note[]> {
		const user: User = await this.getUserWithID(userId)
		const notes: Note[] = await this.userRepository.getNotes(userId)

		if (!notes || notes.length === 0) {
			throw new NotFoundException(`No notes found for ${user.firstName}`)
		}

		return notes
	}

	/**
	 * Joins a user to a classroom
	 * @param userId Unique ID for the user
	 * @param classId Unique ID for classroom to join
	 */
	async joinClassroom(userId: number, classId: string): Promise<void> {
		// First check if user is already in the class
		const alreadyJoined: boolean = await this.classroomService.userInClass(classId, userId)
		if (alreadyJoined) {
			throw new InternalServerErrorException(
				`Cannot join the same classroom more than once! You are already a part of this class`
			)
		}

		// If not, join the user
		const user: User = await this.getUserWithID(userId)
		const res: ClassroomUser = await this.classroomService.addUserToClassroom(classId, user)

		if (!res) {
			throw new InternalServerErrorException(`Failed to join ${user.firstName} to classroom with ID, ${classId}`)
		}
	}

	/**
	 * Removes the specified user from the classroom
	 * @param userId Unique ID for the user
	 * @param classId Unique ID for the classroom
	 */
	async leaveClassroom(userId: number, classId: string): Promise<void> {
		// First check if user is already in the class
		const isMember: boolean = await this.classroomService.userInClass(classId, userId)
		if (!isMember) {
			throw new InternalServerErrorException(`Cannot leave a class that you are not a part of`)
		}

		const cr: Classroom = await this.classroomService.getClassroomWithID(classId)
		let res: boolean

		// Check for ownership of classroom (if owner leaves ... classroom is destroyed)
		if (cr.ownerId === userId) {
			res = await this.classroomService.deleteClassroom(classId, userId)
		} else {
			const user: User = await this.getUserWithID(userId)
			res = await this.classroomService.remUserFromClassroom(classId, user)
		}

		if (!res) {
			throw new InternalServerErrorException(
				`Failed to remove user with ID ${userId} from classroom with ID, ${classId}`
			)
		}
	}
}

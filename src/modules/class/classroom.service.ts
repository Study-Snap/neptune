import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { compareNotesByRating } from '../notes/helper'
import { Note } from '../notes/models/notes.model'
import { ClassroomRepository } from './classroom.repository'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserService } from './user.service'

@Injectable()
export class ClassroomService {
	constructor(
		private readonly classroomRepository: ClassroomRepository,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	async createClassroom(name: string, ownerId: number): Promise<Classroom> {
		// Create classroom
		const cr: Classroom = await this.classroomRepository.insert(name, ownerId)

		// Join the owner to the classroom
		const user: User = await this.userService.getUserWithID(ownerId)
		const cu: ClassroomUser = await this.addUserToClassroom(cr.id, user)

		// Catch any errors with joining the created classroom
		if (!cu || cu.userId !== ownerId) {
			const success: boolean = await this.deleteClassroom(cr.id, ownerId)
			const crName: string = cr.name
			if (!success) {
				throw new InternalServerErrorException(
					`After failing to add ${user.firstName} to ${crName}, also failed to delete ${crName}`
				)
			}
			throw new InternalServerErrorException(`Failed to add ${user.firstName} to ${crName}`)
		}

		return cr
	}

	async getAvailableClassrooms(): Promise<Classroom[]> {
		const classrooms: Classroom[] = await this.classroomRepository.list()

		if (!classrooms || classrooms.length === 0) {
			throw new NotFoundException(`Could not find any classsrooms ...`)
		}

		return classrooms
	}

	async getClassroomWithID(classId: string): Promise<Classroom> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not find a classroom with ID = ${classId}`)
		}

		return cr
	}

	async getClassroomNotes(classId: string, userId: number): Promise<Note[]> {
		const userInClass = await this.userInClass(classId, userId)

		if (!userInClass) {
			throw new ForbiddenException(`Cannot view users for a class that you are not part of`)
		}

		const cr: Classroom = await this.getClassroomWithID(classId)
		const notes: Note[] = await this.classroomRepository.getNotes(cr)

		if (!notes || notes.length === 0) {
			throw new NotFoundException(`No notes were found in ${cr.name}`)
		}

		return notes
	}

	async getTopClassroomNotesByRating(userId: number, classId: string): Promise<Note[]> {
		const userInClass = await this.userInClass(classId, userId)

		// Verify classroom membership
		if (!userInClass) {
			throw new ForbiddenException(
				`User with ID ${userId} is not in classroom with ID ${classId} and is therefore not allowed to see any notes.`
			)
		}

		const cr: Classroom = await this.getClassroomWithID(classId)
		const notes: Note[] = await this.classroomRepository.getNotes(cr)

		if (!notes || notes.length === 0) {
			throw new NotFoundException(`No notes were found in ${cr.name}`)
		}

		return notes.sort(compareNotesByRating)
	}

	async getClassroomUsers(classId: string, userId: number): Promise<User[]> {
		const userInClass = await this.userInClass(classId, userId)

		if (!userInClass) {
			throw new ForbiddenException(`Cannot view users for a class that you are not part of`)
		}

		const cr: Classroom = await this.getClassroomWithID(classId)
		const users: User[] = await this.classroomRepository.getUsers(cr)

		if (!users || users.length === 0) {
			throw new NotFoundException(`Did not find any users in ${cr.name}`)
		}

		return users
	}

	async userInClass(classId: string, userId: number): Promise<boolean> {
		const cr: Classroom = await this.getClassroomWithID(classId)
		const crUsers: User[] = await this.classroomRepository.getUsers(cr)

		if (!cr) {
			throw new NotFoundException(`Classroom with ID ${classId} apparently does not exist...`)
		}

		if (!crUsers || crUsers.filter((user) => user.id === userId).length === 0) {
			return false
		}

		return true
	}

	async updateClassroom(
		classId: string,
		ownerId: number,
		newData: { name?: string; ownerId?: number }
	): Promise<Classroom> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not find a classroom with ID = ${classId}`)
		}

		if (cr.ownerId !== ownerId) {
			throw new ForbiddenException(`You are not authorized to update this classroom (not owner)`)
		}

		return this.classroomRepository.update(cr, newData)
	}

	async deleteClassroom(classId: string, ownerId: number): Promise<boolean> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not delete a classroom with ID = ${classId}`)
		}

		if (cr.ownerId !== ownerId) {
			throw new ForbiddenException(`You are not authorized to delete this classroom (not owner)`)
		}

		return this.classroomRepository.delete(cr)
	}

	async addUserToClassroom(classId: string, user: User): Promise<ClassroomUser> {
		const cr: Classroom = await this.classroomRepository.get(classId)
		return await this.classroomRepository.join(cr, user)
	}

	async remUserFromClassroom(classId: string, user: User): Promise<boolean> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		return await this.classroomRepository.leave(cr, user)
	}
}

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Note } from '../notes/models/notes.model'
import { ClassroomRepository } from './classroom.repository'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'

@Injectable()
export class ClassroomService {
	constructor(private readonly classroomRepository: ClassroomRepository) {}

	async createClassroom(name: string, ownerId: number): Promise<Classroom> {
		return this.classroomRepository.insert(name, ownerId)
	}

	async getClassroomWithID(classId: string): Promise<Classroom> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not find a classroom with ID = ${classId}`)
		}

		return cr
	}

	async getClassroomNotes(classId: string): Promise<Note[]> {
		const cr: Classroom = await this.getClassroomWithID(classId)
		const notes: Note[] = await this.classroomRepository.getNotes(cr)

		if (!notes || notes.length === 0) {
			throw new NotFoundException(`No notes were found in ${cr.name}`)
		}

		return notes
	}

	async getClassroomUsers(classId: string): Promise<User[]> {
		const cr: Classroom = await this.getClassroomWithID(classId)
		const users: User[] = await this.classroomRepository.getUsers(cr)

		if (!users || users.length === 0) {
			throw new NotFoundException(`Did not find any users in ${cr.name}`)
		}

		return users
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

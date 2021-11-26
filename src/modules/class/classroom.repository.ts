import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { Classroom } from './models/classroom.model'
import { ClassroomUser } from './models/classroom-user.model'
import { v4 as uuid } from 'uuid'
import { User } from './models/user.model'
import { Note } from '../notes/models/notes.model'
import { Rating } from '../ratings/models/rating.model'

/**
 * Classroom data interface between service and database
 */
@Injectable()
export class ClassroomRepository {
	constructor(
		@InjectModel(Classroom, DB_CONNECTION_NAME)
		private crModel: typeof Classroom,
		@InjectModel(ClassroomUser, DB_CONNECTION_NAME)
		private cuModel: typeof ClassroomUser
	) {}

	/**
	 * Creates a classroom row in the database with the provided attribute values
	 * @param name Name of the classroom
	 * @param ownerId User ID of the owner for this classroom
	 * @param thumbnailUri A fileID/URI that points to the thumbnail image for this classroom on S3 cloud storage
	 * @returns A classroom objects that was created
	 */
	async insert(name: string, ownerId: number, thumbnailUri: string): Promise<Classroom | undefined> {
		const id: string = uuid()
		return this.crModel.create(
			{
				id,
				name,
				ownerId,
				thumbnailUri
			},
			{ validate: true }
		)
	}

	/**
	 * Returns a list of every classroom in the classrooms table
	 * @returns A list of all classrooms
	 */
	async list(): Promise<Classroom[] | undefined> {
		return this.crModel.findAll()
	}

	async get(id: string): Promise<Classroom | undefined> {
		return this.crModel.findOne({
			where: {
				id
			},
			include: [ Note ]
		})
	}

	/**
	 * Updates allowed fields of a classroom
	 * @param cr The classroom to be updated
	 * @param data New data (key-value pairs) to apply to the classroom
	 * @returns The updated classroom
	 */
	async update(cr: Classroom, data: object): Promise<Classroom | undefined> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException(`Invalid length for update fields specified in update request`)
		}

		return cr.update(data)
	}

	/**
	 * Deletes a classroom (drops) from the classrooms table in the database
	 * @param cr The classroom to be deleted
	 * @returns Whether deletion was successful
	 */
	async delete(cr: Classroom): Promise<boolean> {
		await cr.destroy()
		return true
	}

	/**
	 * Joins a user to a classroom by creating a mapping of classroom <-> user
	 * @param cr The classroom to join
	 * @param user The user joining the classroom
	 * @returns The resulting classroom join relation that is created when a user joins a classroom
	 */
	async join(cr: Classroom, user: User): Promise<ClassroomUser> {
		return this.cuModel.create({
			classId: cr.id,
			userId: user.id
		})
	}

	/**
	 * Removes a mapping from ClassroomUser to remove a given user from a given classroom
	 * @param cr The Classroom to leave
	 * @param user The user leaving the classroom
	 * @returns True/False depending on whether the relation drop was successful. True iff successful leave.
	 */
	async leave(cr: Classroom, user: User): Promise<boolean> {
		const cu: ClassroomUser = await this.cuModel.findOne({ where: { classId: cr.id, userId: user.id } })

		if (!cu) {
			throw new NotFoundException(`Could not find ${user.firstName} ${user.lastName} in ${cr.name} ... `)
		}

		// delete the relationship (ie: user leaves classroom)
		await cu.destroy()
		return true
	}

	/**
	 * Gets a list of users who are all members of a classroom
	 * @param cr The Classroom
	 * @returns A list of users who are part of the given classroom
	 */
	async getUsers(cr: Classroom): Promise<User[] | undefined> {
		const crUser: Classroom = await this.crModel.findOne({
			where: { id: cr.id },
			include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } } ]
		})

		return crUser.users
	}

	/**
	 * Gets a list of notes that are contained within the provided classroom
	 * @param cr The classroom
	 * @returns A list of notes who are contained within the classroom provided
	 */
	async getNotes(cr: Classroom): Promise<Note[] | undefined> {
		return (await this.crModel.findOne({
			where: { id: cr.id },
			include: [
				{
					model: Note,
					include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Rating ]
				}
			]
		})).notes
	}

	/**
	 * Gets a specific note object with a condition that it is inside of a specified classroom
	 * @param cr The Classroom
	 * @param noteId The ID for the note within a classroom
	 * @returns A note with the specified ID as long as it is within the classroom provided
	 */
	async getNoteWithIDInClass(cr: Classroom, noteId: number): Promise<Note | undefined> {
		const results = cr.notes.filter((note) => note.id === noteId)

		// Return the first (and hopefully only) result
		return results[0]
	}
}

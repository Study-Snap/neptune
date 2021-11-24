import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { SpaceType } from '../../common/constants'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { FilesService } from '../files/files.service'
import { compareNotesWithCombinedFeatures } from '../notes/helper'
import { Note } from '../notes/models/notes.model'
import { ClassroomRepository } from './classroom.repository'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserService } from './user.service'

const config: IConfigAttributes = getConfig()

/**
 * Handles high-level service functions related to classroom functionality
 */
@Injectable()
export class ClassroomService {
	constructor(
		private readonly classroomRepository: ClassroomRepository,
		private readonly filesService: FilesService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	/**
	 * Deletes a thumbnail from remote S3 cloud storage
	 * @param thumbUri The URI that points to the remote thumbnail to be deleted from s3 object storage
	 */
	async deleteClassroomThumbnail(thumbUri: string): Promise<void> {
		const thumbnailCustom = !(thumbUri === config.classThumbnailDefaultURI)
		if (thumbnailCustom) {
			// Delete the uploaded thumbnail
			await this.filesService.deleteFileWithID(thumbUri, SpaceType.IMAGES)
		}
	}

	/**
	 * Creates a classroom given the provided attribute values as parameters
	 * @param name Name of the classroom
	 * @param ownerId User ID which is the owner of the classroom
	 * @param thumbnailUri A URI that points to a custom thumbnail to use for this classroom
	 * @returns The created classroom object
	 */
	async createClassroom(name: string, ownerId: number, thumbnailUri?: string): Promise<Classroom> {
		// Create classroom
		const thumbUri = thumbnailUri ? thumbnailUri : config.classThumbnailDefaultURI

		// Ensure thumbnail exists on remote
		const fileExists = await this.filesService.remoteFileExists(thumbUri, SpaceType.IMAGES)
		if (!fileExists) {
			throw new NotFoundException(`File with URI of ${thumbUri} does not exist. Try uploading again`)
		}

		// Confirm valid URI
		const validImage = await this.filesService.isValidFileType(thumbUri, SpaceType.IMAGES)
		if (!validImage) {
			throw new BadRequestException(
				`Invalid thumbnail format was submitted to create the classroom. Supported are (jpg, png)`
			)
		}

		const cr: Classroom = await this.classroomRepository.insert(
			name,
			ownerId,
			`https://${config.imageDataSpace}.${config.spacesEndpoint}/${thumbUri}`
		)

		// Ensure classroom object was created (inserted)
		if (!cr) {
			await this.deleteClassroomThumbnail(thumbUri)
			throw new InternalServerErrorException(`Failed to create(insert) the classroom ...`)
		}

		// Join the owner to the classroom
		const user: User = await this.userService.getUserWithID(ownerId)
		const cu: ClassroomUser = await this.addUserToClassroom(cr.id, user)

		// Catch any errors with joining the created classroom
		if (!cu || cu.userId !== ownerId) {
			const success: boolean = await this.deleteClassroom(cr.id, ownerId)
			const crName: string = cr.name
			if (!success) {
				await this.deleteClassroomThumbnail(thumbUri) // Ensure thumbnail file deleted
				throw new InternalServerErrorException(
					`After failing to add ${user.firstName} to ${crName}, also failed to delete ${crName}`
				)
			}
			throw new InternalServerErrorException(`Failed to add ${user.firstName} to ${crName}`)
		}

		return cr
	}

	/**
	 * Gets a list of available classrooms for the user to join
	 * @returns A list of available classrooms to the user
	 */
	async getAvailableClassrooms(): Promise<Classroom[]> {
		const classrooms: Classroom[] = await this.classroomRepository.list()

		if (!classrooms || classrooms.length === 0) {
			throw new NotFoundException(`Could not find any classsrooms ...`)
		}

		return classrooms
	}

	/**
	 * Gets the details for a classroom given it's unique ID
	 * @param classId The unique ID for a classroom
	 * @returns A classroom object (if found) that has the specified unique ID
	 */
	async getClassroomWithID(classId: string): Promise<Classroom> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not find a classroom with ID = ${classId}`)
		}

		return cr
	}

	/**
	 * Gets all notes contained within a classroom provided the correct access requirements for the provided user
	 * @param classId Unique ID for the classroom
	 * @param userId Unique user ID for the User making the request
	 * @returns A list of notes that are in the classroom
	 */
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

	/**
	 * Gets the best rated and latest notes contained within a specified classroom
	 * @param userId Unique ID for the user making request
	 * @param classId Unique ID for the classroom
	 * @returns A list of notes that have gone through a ranking algorithm to sort for the best notes
	 */
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

		return notes.sort(compareNotesWithCombinedFeatures)
	}

	/**
	 * Gets all users that are members of the specified classroom
	 * @param classId Unique ID for a classroom
	 * @param userId Unique ID for requesting user
	 * @returns The list of users that are members of the specified classroom
	 */
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

	/**
	 * performs a check to validate whether a user is a member of the specified classroom
	 * @param classId Unique ID for a classroom
	 * @param userId Unique ID for a User making the request
	 * @returns True iff the user IS a member of the specified classroom
	 */
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

	/**
	 * Updates the classroom with given data in key-value pairs provided the correct access and a valid classroom is selected
	 * @param classId Unique ID for the classroom to be updated
	 * @param ownerId Unique ID for the user that makes the request and owns the classroom
	 * @param data The new data object that specifies which attributes can be changed and allows new values to be entered
	 * @returns The updated classroom object
	 */
	async updateClassroom(
		classId: string,
		ownerId: number,
		data: { name?: string; ownerId?: number; thumbnailUri?: string }
	): Promise<Classroom> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not find a classroom with ID = ${classId}`)
		}

		if (cr.ownerId !== ownerId) {
			throw new ForbiddenException(`You are not authorized to update this classroom (not owner)`)
		}

		if (data.thumbnailUri) {
			// Delete old thumbnail
			await this.deleteClassroomThumbnail(cr.thumbnailUri)
		}

		return this.classroomRepository.update(cr, data)
	}

	/**
	 * Deletes a classroom
	 * @param classId Classroom ID for classroom to delete
	 * @param ownerId The user who is requesting deletion and is owner of the classroom
	 * @returns True iff the classroom is deleted successfully along with related data in S3 object storage
	 */
	async deleteClassroom(classId: string, ownerId: number): Promise<boolean> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		if (!cr) {
			throw new NotFoundException(`Could not delete a classroom with ID = ${classId}`)
		}

		if (cr.ownerId !== ownerId) {
			throw new ForbiddenException(`You are not authorized to delete this classroom (not owner)`)
		}

		// Ensure thumbnail is deleted with the classroom
		await this.deleteClassroomThumbnail(cr.thumbnailUri)
		return this.classroomRepository.delete(cr)
	}

	/**
	 * Adds a user to a classroom
	 * @param classId Unique ID for the classroom to add user to
	 * @param user User object for user to add to the classroom
	 * @returns Returns the created Classroom <-> User mapping describing the user being added as member of a classroom
	 */
	async addUserToClassroom(classId: string, user: User): Promise<ClassroomUser> {
		const cr: Classroom = await this.classroomRepository.get(classId)
		return await this.classroomRepository.join(cr, user)
	}

	/**
	 * Removes a user from a classroom
	 * @param classId Unique ID for the classroom to remove user from
	 * @param user User object for user to remove from the classroom
	 * @returns Returns True iff user is successfully removed from the classroom
	 */
	async remUserFromClassroom(classId: string, user: User): Promise<boolean> {
		const cr: Classroom = await this.classroomRepository.get(classId)

		return await this.classroomRepository.leave(cr, user)
	}
}

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME, DB_USERS_PASSWORD_FIELD } from '../../common/constants'
import { User } from '../class/models/user.model'
import { Note } from '../notes/models/notes.model'
import { Rating } from './models/rating.model'

/**
 * Describes interface between ratings service functions and the database actions
 */
@Injectable()
export class RatingsRepository {
	constructor(
		@InjectModel(Rating, DB_CONNECTION_NAME)
		private ratingModel: typeof Rating
	) {}

	/**
	 * Provides all details related to a specific rating specified by ID
	 * @param id Unique Rating ID
	 * @returns Rating object with details about the rating
	 */
	async findRatingByID(id: number): Promise<Rating> {
		return this.ratingModel.findOne({
			where: {
				id
			},
			include: [ { model: User, attributes: { exclude: [ DB_USERS_PASSWORD_FIELD ] } }, Note ]
		})
	}

	/**
	 * Insers a new rating for a specified note
	 * @param noteId Note ID which this rating is associated with
	 * @param userId User ID which this rating is associated with
	 * @param value The value of the rating
	 * @returns The newly inserted/created rating object for the note specified by noteID
	 */
	async insert(noteId: number, userId: number, value: number): Promise<Rating> {
		return this.ratingModel.create({
			value,
			noteId,
			userId
		})
	}

	/**
	 * Updates a rating value for a specified rating
	 * @param rating A rating object to be updated
	 * @param newValue The new rating value
	 * @returns The newly updated rating object
	 */
	async update(rating: Rating, newValue: number): Promise<Rating> {
		if (!newValue) {
			throw new BadRequestException(`Must provide a new value to set to this rating ...`)
		}

		return rating.update({ value: newValue })
	}

	/**
	 * Removes (drops) a rating from the database
 	 * @param rating Rating object for rating to be deleted
	 * @returns True iff the rating is removed successfully
	 */
	async delete(rating: Rating): Promise<boolean> {
		await rating.destroy()
		return true
	}
}

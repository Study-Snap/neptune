import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Rating } from './models/rating.model'
import { RatingsRepository } from './ratings.repository'

/**
 * All associated functionality for interacting with ratings
 */
@Injectable()
export class RatingsService {
	constructor(private readonly ratingsRepository: RatingsRepository) {}

	/**
	 * Gets details about a rating given its ID
	 * @param id ID for the rating
	 * @returns The specific rating object with specified ID
	 */
	async getRatingWithID(id: number): Promise<Rating> {
		const rating: Rating = await this.ratingsRepository.findRatingByID(id)

		if (!rating) {
			throw new NotFoundException(`Could not find a rating with ID, ${id}`)
		}

		return rating
	}

	/**
	 * Adds a rating to a note
	 * @param value The value of the rating between 1-5
	 * @param userId User ID for user making the rating
	 * @param noteId The note ID for the note this rating is for
	 * @returns The created Rating object
	 */
	async addRating(value: number, userId: number, noteId: number): Promise<Rating> {
		return this.ratingsRepository.insert(noteId, userId, value)
	}

	/**
	 * Updates a rating for a specified note
	 * @param id Unique ID for the rating
	 * @param newRating New rating value to apply between 1-5
	 * @returns The updated rating object
	 */
	async updateRating(id: number, newRating: number): Promise<Rating> {
		const rating: Rating = await this.getRatingWithID(id)

		return this.ratingsRepository.update(rating, newRating)
	}

	/**
	 * Deletes a rating from a note
	 * @param id Rating id for rating to be removed
	 * @returns A status code and message depending on the outcome of the deletion.
	 */
	async removeRating(id: number): Promise<{ statusCode: number; message: string }> {
		const rating: Rating = await this.getRatingWithID(id)
		const res = await this.ratingsRepository.delete(rating)

		if (!res) {
			throw new InternalServerErrorException(`Problem trying to remove rating with ID, ${id}`)
		}

		return {
			statusCode: 200,
			message: `Rating with ID, ${id} was removed successfully!`
		}
	}
}

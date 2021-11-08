import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Rating } from './models/rating.model'
import { RatingsRepository } from './ratings.repository'

@Injectable()
export class RatingsService {
	constructor(private readonly ratingsRepository: RatingsRepository) {}

	async getRatingWithID(id: number): Promise<Rating> {
		const rating: Rating = await this.ratingsRepository.findRatingByID(id)

		if (!rating) {
			throw new NotFoundException(`Could not find a rating with ID, ${id}`)
		}

		return rating
	}

	async addRating(value: number, userId: number, noteId: number): Promise<Rating> {
		return this.ratingsRepository.insert(noteId, userId, value)
	}

	async updateRating(id: number, newRating: number): Promise<Rating> {
		const rating: Rating = await this.getRatingWithID(id)

		return this.ratingsRepository.update(rating, newRating)
	}

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

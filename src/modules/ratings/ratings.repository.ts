import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from '../../common/constants'
import { User } from '../class/models/user.model'
import { Note } from '../notes/models/notes.model'
import { Rating } from './models/rating.model'

@Injectable()
export class RatingsRepository {
	constructor(
		@InjectModel(Rating, DB_CONNECTION_NAME)
		private ratingModel: typeof Rating
	) {}

	async findRatingByID(id: number): Promise<Rating> {
		return this.ratingModel.findOne({
			where: {
				id
			},
			include: [ User, Note ]
		})
	}

	async insert(noteId: number, userId: number, value: number): Promise<Rating> {
		return this.ratingModel.create({
			value,
			noteId,
			userId
		})
	}

	async update(rating: Rating, newValue: number): Promise<Rating> {
		if (!newValue) {
			throw new BadRequestException(`Must provide a new value to set to this rating ...`)
		}

		return rating.update({ value: newValue })
	}

	async delete(rating: Rating): Promise<boolean> {
		await rating.destroy()
		return true
	}
}

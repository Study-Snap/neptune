import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
import { Rating } from './models/rating.model'

@Injectable()
export class RatingsRepository {
	constructor(
		@InjectModel(Rating, DB_CONNECTION_NAME)
		private ratingModel: typeof Rating
	) {}
}

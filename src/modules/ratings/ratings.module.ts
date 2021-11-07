import { RatingsService } from './ratings.service'
import { Module } from '@nestjs/common'
import { RatingsRepository } from './ratings.repository'
import { Note } from '../notes/models/notes.model'
import { SequelizeModule } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
import { Rating } from './models/rating.model'
import { User } from '../class/models/user.model'

@Module({
	imports: [ SequelizeModule.forFeature([ Note, Rating, User ], DB_CONNECTION_NAME) ],
	controllers: [],
	providers: [ RatingsRepository, RatingsService ]
})
export class RatingsModule {}

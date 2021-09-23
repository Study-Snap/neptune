import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { NotesRepository } from './notes.repository'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'
import { User } from '../class/models/user.model'
import { Classroom } from '../class/models/classroom.model'
import { DB_CONNECTION_NAME } from '../../common/constants'
import { ClassroomUser } from '../class/models/classroom-user.model'
import { Note } from './models/notes.model'
import { ClassroomService } from '../class/classroom.service'
import { UserService } from '../class/user.service'
import { ClassroomRepository } from '../class/classroom.repository'
import { UserRepository } from '../class/user.repository'

@Module({
	imports: [ SequelizeModule.forFeature([ User, Classroom, ClassroomUser, Note ], DB_CONNECTION_NAME) ],
	controllers: [ NotesController ],
	providers: [
		NotesService,
		NotesRepository,
		FilesService,
		ElasticsearchService,
		ClassroomService,
		ClassroomRepository,
		UserService,
		UserRepository
	],
	exports: [ SequelizeModule ]
})
export class NotesModule {}

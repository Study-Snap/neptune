import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Note } from './models/notes.model'
import { NotesRepository } from './notes.repository'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'
import { NOTE_DB_CONNECTION } from 'src/common/constants'

@Module({
	imports: [ SequelizeModule.forFeature([ Note ], NOTE_DB_CONNECTION) ],
	controllers: [ NotesController ],
	providers: [ NotesService, NotesRepository, FilesService, ElasticsearchService ],
	exports: [ SequelizeModule ]
})
export class NotesModule {}

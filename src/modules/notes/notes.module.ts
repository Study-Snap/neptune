import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Note } from './models/notes.model'
import { NotesRepository } from './notes.repository'
import { FilesService } from '../files/files.service'
import { ElasticsearchService } from './elasticsearch.service'

@Module({
	imports: [ SequelizeModule.forFeature([ Note ]) ],
	controllers: [ NotesController ],
	providers: [ NotesService, NotesRepository, FilesService, ElasticsearchService ],
	exports: [ SequelizeModule ]
})
export class NotesModule {}

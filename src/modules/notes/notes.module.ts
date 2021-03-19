import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Note } from './models/notes.model'
import { NotesRepository } from './notes.repository'

@Module({
	imports: [SequelizeModule.forFeature([Note])],
	controllers: [NotesController],
	providers: [NotesService, NotesRepository],
	exports: [SequelizeModule]
})
export class NotesModule {}

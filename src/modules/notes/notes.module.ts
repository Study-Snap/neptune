import { NotesService } from './notes.service'
import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Note } from './models/notes.model'
import { NotesRepository } from './notes.repository'
import { MulterModule } from '@nestjs/platform-express'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from 'src/config'

// Get app configuration
const config: IConfigAttributes = getConfig()

@Module({
	imports: [
		SequelizeModule.forFeature([
			Note
		]),
		MulterModule.register({
			dest: config.fileStorageLocation
		})
	],
	controllers: [
		NotesController
	],
	providers: [
		NotesService,
		NotesRepository
	],
	exports: [
		SequelizeModule
	]
})
export class NotesModule {}

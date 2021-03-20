import { FilesService } from './files.service'
import { Module } from '@nestjs/common'
import { FilesController } from './files.controller'

@Module({
	imports: [],
	controllers: [
		FilesController
	],
	providers: [
		FilesService
	]
})
export class FilesModule {}

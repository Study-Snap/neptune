import { NotesController } from './notes.controller'
import { Module } from '@nestjs/common'

@Module({
	imports: [],
	controllers: [NotesController],
	providers: []
})
export class NotesModule {}

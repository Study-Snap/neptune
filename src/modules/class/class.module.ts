import { Module } from '@nestjs/common'
import { ClassroomController } from './classroom.controller'
import { ClassroomRepository } from './classroom.repository'
import { ClassroomService } from './classroom.service'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
	imports: [],
	controllers: [ ClassroomController, UserController ],
	providers: [ ClassroomService, UserService, ClassroomRepository, UserRepository ]
})
export class ClassModule {}

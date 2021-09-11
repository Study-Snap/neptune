import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { DB_CONNECTION_NAME } from 'src/common/constants'
import { ClassroomController } from './classroom.controller'
import { ClassroomRepository } from './classroom.repository'
import { ClassroomService } from './classroom.service'
import { ClassroomUser } from './models/classroom-user.model'
import { Classroom } from './models/classroom.model'
import { User } from './models/user.model'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
	imports: [ SequelizeModule.forFeature([ User, Classroom, ClassroomUser ], DB_CONNECTION_NAME) ],
	controllers: [ ClassroomController, UserController ],
	providers: [ ClassroomService, UserService, ClassroomRepository ] // TODO: Add back repositories and find out why it's not working
})
export class ClassModule {}

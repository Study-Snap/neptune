import {
	BadRequestException,
	Controller,
	HttpStatus,
	Post,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { editFileName } from '../notes/helper'

const config: IConfigAttributes = getConfig()

@Controller('api/files')
export class FilesController {
	@JwtAuth()
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: config.fileStorageLocation,
				filename: editFileName
			})
		})
	)
	@Post()
	async createNoteFile(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<object> {
		if (!file) {
			throw new BadRequestException('You must include a file')
		}

		// Return the uploaded file ID and type
		return {
			statusCode: HttpStatus.CREATED,
			fileId: file.filename.split('.')[0],
			fileType: file.filename.split('.')[1],
			message: 'File was successfully uploaded to cloud storage'
		}
	}
}

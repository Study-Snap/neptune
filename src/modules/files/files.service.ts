import { Injectable, NotFoundException } from '@nestjs/common'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'

const config: IConfigAttributes = getConfig()

@Injectable()
export class FilesService {
	async deleteFileWithId(file: { id: string; type: string }): Promise<boolean> {
		const filePath: string = `${config.fileStorageLocation}/${file.id}.${file.type}`
		const fileExists: boolean = existsSync(filePath)

		if (!fileExists) {
			throw new NotFoundException(`Could not find a file with ID, ${file.id}`)
		}

		// Delete the file
		await unlink(filePath)

		return true
	}
}

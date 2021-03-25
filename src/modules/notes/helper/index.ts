import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import * as util from 'util'
import * as fs from 'fs'
import * as pdf from 'pdf-parse'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from 'src/config'


const config: IConfigAttributes = getConfig()

// Works only on PDF
export async function extractBodyFromFile(path: string): Promise<string | undefined> {

	const readFile = util.promisify(fs.readFile)
	const buffer =  await readFile(`${config.fileStorageLocation}/${path}`)
	const pdfData = await pdf(buffer, {max: 16}) 

	console.log(pdfData)

	return pdfData.text
}

export async function calculateReadTimeMinutes(body: string): Promise<number> {
	// Source: https://irisreading.com/what-is-the-average-reading-speed/
	const avgWordsPerMin = 200

	return Math.round(body.split(' ').length / avgWordsPerMin) + 1
}

// Used to initialize a ratings format for a new note
export function createEmptyRatings(ratingsSize?: number): number[] {
	if (ratingsSize) {
		return Array(ratingsSize).fill(0)
	}
	return []
}

export function editFileName(req, file: Express.Multer.File, cb) {
	const name = file.originalname.split('.')[0]
	const fileExtName = extname(file.originalname)
	cb(null, `${name}-${uuid()}${fileExtName}`)
}

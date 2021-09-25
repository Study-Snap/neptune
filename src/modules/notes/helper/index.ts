import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import * as util from 'util'
import * as fs from 'fs'
import * as pdf from 'pdf-parse'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../../config'
import { Note } from '../models/notes.model'

const config: IConfigAttributes = getConfig()

// Works only on PDF
export async function extractBodyFromFile(path: string): Promise<string | undefined> {
	const pathComponents: string[] = path.split('.')
	if (pathComponents[pathComponents.length - 1] !== 'pdf') {
		return 'BAD FORMAT (required: PDF)'
	}

	const readFile = util.promisify(fs.readFile)
	const buffer = await readFile(`${config.fileStorageLocation}/${path}`)
	const pdfData = await pdf(buffer, { max: 16 })

	return pdfData.text
}

export async function calculateReadTimeMinutes(body: string): Promise<number> {
	// Source: https://irisreading.com/what-is-the-average-reading-speed/
	const avgWordsPerMin = 200

	return Math.round(body.split(' ').length / avgWordsPerMin) + 1
}

// Used to initialize a ratings format for a new note (stick to defaul)
export function createEmptyRatings(ratingsSize = 5): number[] {
	return Array(ratingsSize).fill(0)
}

export function editFileName(req, file: Express.Multer.File, cb) {
	const name = file.originalname.split('.')[0]
	const fileExtName = extname(file.originalname)
	cb(null, `${name}-${uuid()}${fileExtName}`)
}

// Used to compare notes by rating
export function compareNotesByRating(a: Note, b: Note): number {
	// Get the highest rating
	const aRating = a.rating.indexOf(Math.max(...a.rating))
	const bRating = b.rating.indexOf(Math.max(...b.rating))

	// Get total ratings
	const aTotal = a.rating.reduce((a, b) => a + b, 0)
	const bTotal = a.rating.reduce((a, b) => a + b, 0)

	if (aRating < bRating) {
		// Note b is higher rated
		return 1
	}
	if (aRating > bRating) {
		// Note a is higher rated
		return -1
	}

	// equal rated (check counts)
	if (aTotal < bTotal) {
		// B has more ratings in total
		return 1
	}
	if (aTotal > bTotal) {
		// A has more ratings in total
		return -1
	}

	// Complete tie
	return 0
}

import { extname } from 'path'
import { v4 as uuid } from 'uuid'
import * as util from 'util'
import * as fs from 'fs'
import * as pdf from 'pdf-parse'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../../config'
import { Note } from '../models/notes.model'

const config: IConfigAttributes = getConfig()

/**
 * Extracts the body/text from a note file for use in the current DB implementation
 * @param path The path to the note file
 * @returns A full-text extraction from the PDF document containing all content and some formatting
 */
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

/**
 * Calculates the average read time for a note
 * @param body The body of the note being uploaded
 * @returns A n average read time for the generic user
 */
export async function calculateReadTimeMinutes(body: string): Promise<number> {
	// Source: https://irisreading.com/what-is-the-average-reading-speed/
	const avgWordsPerMin = 200

	return Math.round(body.split(' ').length / avgWordsPerMin) + 1
}

/**
 * Used to initialize a ratings format for a new note (stick to defaul)
 * @param ratingsSize The number of stars for this rating object
 * @returns An array of ratingSize initialized with zeroes
 */
export function createEmptyRatings(ratingsSize = 5): number[] {
	return Array(ratingsSize).fill(0)
}

/**
 * Overrides default file name and allows additional elements to be part of the file name
 * @param req The request object from the HTTP request
 * @param file The Multer File object containing a buffer and file metadata
 * @param cb The callback function for which to pass the resulting fileName back to the Multer upload middleware to override default filenames
 */
export function editFileName(req, file: Express.Multer.File, cb) {
	const name = file.originalname.split('.')[0]
	const fileExtName = extname(file.originalname)
	cb(null, `${name}-${uuid()}${fileExtName}`)
}

/**
 * 
 * @param a A Note object to be compared
 * @param b A Note object to be compared
 * @returns A number, positive Indicates that note B wins and negative indicates that note A wins
 */
export function compareNotesWithCombinedFeatures(a: Note, b: Note): number {
	// Establish points (weights)
	let aPoints = 0
	let bPoints = 0

	// First find our which is newer
	const aCreated = new Date(a.createdAt)
	const bCreated = new Date(b.createdAt)
	aCreated < bCreated ? (aPoints += 30) : (bPoints += 30)

	// Now calculate points for each notes ratings
	aPoints += a.rating.reduce((a, b, i) => a + b * i, 0)
	bPoints += b.rating.reduce((a, b, i) => a + b * i, 0)

	// Finally compare and return
	return bPoints - aPoints
}

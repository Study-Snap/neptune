import { Note } from '../models/notes.model'

/**
 * Takes the full contents of a note upload and trims it to 50 words or less
 * @param body The full contents of an uploaded note
 * @returns A small abstract representative of the note
 */
export async function createNoteAbstract(body: string): Promise<string> {
	const words = body.split(' ')
	return `${words.slice(0, Math.min(50, words.length)).join(' ')} ...`
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

import {} from 'fs'
import { extname } from 'path'
import { v4 as uuid } from 'uuid'

// Works only on PDF
export async function extractBodyFromFile(path: string): Promise<string | undefined> {
	console.log(path)
	// TODO: Implement actual file extraction
	return 'Sample body text for a note'
}

export async function calculateReadTimeMinutes(body: string): Promise<number> {
	// Source: https://irisreading.com/what-is-the-average-reading-speed/
	const avgWordsPerMin = 200

	return body.split(' ').length / avgWordsPerMin
}

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
// Works only on PDF
export async function extractBodyFromFile(file: Express.Multer.File): Promise<string | undefined> {
	// TODO: Implement actual file extraction
	return 'Sample body text for a note'
}

export async function calculateReadTimeMinutes(body: string): Promise<number> {
	return 10
}

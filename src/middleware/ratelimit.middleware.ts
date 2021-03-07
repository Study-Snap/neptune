import * as rateLimit from 'express-rate-limit'

export const limitRequests = (limit) =>
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: limit
	})

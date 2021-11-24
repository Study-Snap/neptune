import * as rateLimit from 'express-rate-limit'

/**
 * Applies rate limiting to any endpoint or app that implements this middleware
 * @param limit The maximum number of requests in a 24 hour period
 * @returns The ratelimiter middleware which can be applied to endpoints or an application
 */
export const limitRequests = (limit) =>
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: limit
	})

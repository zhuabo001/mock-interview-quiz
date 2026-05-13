import { HttpHandler } from 'msw'

// handlers will be added per module (products, customers, holdings, followups)
export const handlers: HttpHandler[] = []

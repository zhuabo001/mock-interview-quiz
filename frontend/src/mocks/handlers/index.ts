import { HttpHandler } from 'msw'
import { fundHandlers } from './funds'
import { clientHandlers } from './clients'
import { followupHandlers } from './followups'
import { dashboardHandlers } from './dashboard'

// handlers will be added per module (products, customers, holdings, followups)
export const handlers: HttpHandler[] = [
  ...fundHandlers,
  ...clientHandlers,
  ...followupHandlers,
  ...dashboardHandlers,
]

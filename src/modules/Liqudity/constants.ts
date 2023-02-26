import type { Address } from 'everscale-inpage-provider'

import type { CommonTokenTransactionReceipt } from '@/modules/Liqudity/types'

export const RECEIPTS = new Map<string, CommonTokenTransactionReceipt & { poolAddress?: Address }>()

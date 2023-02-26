import { Address } from 'everscale-inpage-provider'

/**
 * Returns true if addresses are equals
 * @param {Address} [a]
 * @param {Address} [b]
 */
export function addressesComparer(a?: Address, b?: Address): boolean {
    return a !== undefined && a?.toString().toLowerCase() === b?.toString().toLowerCase()
}

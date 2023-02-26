import * as React from 'react'
import { reaction } from 'mobx'

import { useFavoritePairs, useFavoritePools } from '@/stores/FavoritePairs'
import { storage } from '@/utils'
import { useForceUpdate } from '@/hooks/useForceUpdate'

export function useFavoritesPoolsStorage(): string[] {
    const favoritesPairs = useFavoritePairs()
    const favoritePools = useFavoritePools()
    const forceUpdate = useForceUpdate()

    React.useEffect(() => reaction(() => favoritesPairs.addresses, addresses => {
        if (addresses.length > 0) {
            addresses.forEach(address => favoritePools.add(address, undefined, true))
            favoritesPairs.clear()
            storage.remove('favorite_pairs')
            favoritePools.saveToStorage()
        }
    }, { fireImmediately: true }), [])

    React.useEffect(() => reaction(() => favoritePools.addresses, forceUpdate, { fireImmediately: true }), [])

    return favoritePools.addresses ?? []
}

import * as React from 'react'
import { Address } from 'everscale-inpage-provider'

import { AddLiquidityFormStore } from '@/modules/Pools/stores'
import { useDexAccount } from '@/stores/DexAccountService'
import type { DexAccountService } from '@/stores/DexAccountService'
import { useTokensCache } from '@/stores/TokensCacheService'
import type { TokensCacheService } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'
import type { WalletService } from '@/stores/WalletService'

// @ts-ignore
export const AddLiquidityFormStoreContext = React.createContext<AddLiquidityFormStore>()

export type AddLiquidityFormStoreProviderProps = React.PropsWithChildren<{
    dex?: DexAccountService;
    poolAddress: Address | string;
    tokensCache?: TokensCacheService;
    wallet?: WalletService;
}>

export function useAddLiquidityFormStoreContext(): AddLiquidityFormStore {
    return React.useContext(AddLiquidityFormStoreContext)
}

export function AddLiquidityFormStoreProvider(props: AddLiquidityFormStoreProviderProps): JSX.Element {
    const {
        children,
        dex = useDexAccount(),
        poolAddress,
        tokensCache = useTokensCache(),
        wallet = useWallet(),
    } = props

    const { current: context } = React.useRef(new AddLiquidityFormStore(poolAddress, wallet, dex, tokensCache))

    return (
        <AddLiquidityFormStoreContext.Provider value={context}>
            {children}
        </AddLiquidityFormStoreContext.Provider>
    )
}

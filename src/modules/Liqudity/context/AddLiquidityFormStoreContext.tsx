import * as React from 'react'

import { AddLiquidityFormStore } from '@/modules/Liqudity/stores'
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
        tokensCache = useTokensCache(),
        wallet = useWallet(),
    } = props

    const { current: context } = React.useRef(new AddLiquidityFormStore(wallet, dex, tokensCache))

    return (
        <AddLiquidityFormStoreContext.Provider value={context}>
            {children}
        </AddLiquidityFormStoreContext.Provider>
    )
}

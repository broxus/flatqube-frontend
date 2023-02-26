import * as React from 'react'

import { RemoveLiquidityFormStore } from '@/modules/Pools/stores'
import { useDexAccount } from '@/stores/DexAccountService'
import type { DexAccountService } from '@/stores/DexAccountService'
import { useTokensCache } from '@/stores/TokensCacheService'
import type { TokensCacheService } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'
import type { WalletService } from '@/stores/WalletService'

// @ts-ignore
export const RemoveLiquidityFormStoreContext = React.createContext<RemoveLiquidityFormStore>()

export type RemoveLiquidityFormStoreProviderProps = React.PropsWithChildren<{
    dex?: DexAccountService;
    poolAddress: string;
    tokensCache?: TokensCacheService;
    wallet?: WalletService;
}>

export function useRemoveLiquidityFormStoreContext(): RemoveLiquidityFormStore {
    return React.useContext(RemoveLiquidityFormStoreContext)
}

export function RemoveLiquidityFormStoreProvider(props: RemoveLiquidityFormStoreProviderProps): JSX.Element {
    const {
        children,
        dex = useDexAccount(),
        poolAddress,
        tokensCache = useTokensCache(),
        wallet = useWallet(),
    } = props

    const { current: context } = React.useRef(new RemoveLiquidityFormStore(poolAddress, wallet, dex, tokensCache))

    return (
        <RemoveLiquidityFormStoreContext.Provider value={context}>
            {children}
        </RemoveLiquidityFormStoreContext.Provider>
    )
}

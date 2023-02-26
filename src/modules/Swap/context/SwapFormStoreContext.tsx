import * as React from 'react'

import { SwapFormStore } from '@/modules/Swap/stores/SwapFormStore'
import type { SwapFormCtorOptions } from '@/modules/Swap/stores/SwapFormStore'
import { useTokensCache } from '@/stores/TokensCacheService'
import type { TokensCacheService } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'
import type { WalletService } from '@/stores/WalletService'

// @ts-ignore
export const SwapFormStoreContext = React.createContext<SwapFormStore>()

export type SwapFormStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (formStore: SwapFormStore) => Promise<void>;
    tokensCache?: TokensCacheService;
    wallet?: WalletService;
} & SwapFormCtorOptions>

export function useSwapFormStoreContext(): SwapFormStore {
    return React.useContext(SwapFormStoreContext)
}

export function SwapFormStoreProvider(props: SwapFormStoreProviderProps): JSX.Element {
    const {
        beforeInit,
        children,
        coinToTip3Address,
        comboToTip3Address,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
        minTvlValue,
        referrer,
        safeAmount,
        tip3ToCoinAddress,
        tokensCache = useTokensCache(),
        wallet = useWallet(),
        wrapGas,
        wrappedCoinTokenAddress,
        wrappedCoinVaultAddress,
    } = props

    const options = React.useMemo(() => ({
        coinToTip3Address,
        comboToTip3Address,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
        minTvlValue,
        referrer,
        safeAmount,
        tip3ToCoinAddress,
        wrapGas,
        wrappedCoinTokenAddress,
        wrappedCoinVaultAddress,
    }), [
        coinToTip3Address,
        comboToTip3Address,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
        minTvlValue,
        referrer,
        safeAmount,
        tip3ToCoinAddress,
        wrapGas,
        wrappedCoinTokenAddress,
        wrappedCoinVaultAddress,
    ])

    const context = React.useMemo<SwapFormStore>(
        () => new SwapFormStore(wallet, tokensCache, { ...options }),
        [options],
    )

    React.useEffect(() => {
        beforeInit?.(context)
    }, [context])

    return (
        <SwapFormStoreContext.Provider value={context}>
            {children}
        </SwapFormStoreContext.Provider>
    )
}

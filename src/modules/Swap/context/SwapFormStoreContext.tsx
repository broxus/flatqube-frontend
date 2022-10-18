import * as React from 'react'
import { reaction } from 'mobx'

import { SwapFormStore } from '@/modules/Swap/stores/SwapFormStore'
import { WalletService } from '@/stores/WalletService'
import { SwapFormCtorOptions } from '@/modules/Swap/types'
import { useNotifiedCallbacks } from '@/modules/Swap/hooks/useNotifiedCallbacks'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { error } from '@/utils'

// @ts-ignore
export const SwapFormStoreContext = React.createContext<SwapFormStore>()

export type SwapFormStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (formStore: SwapFormStore) => Promise<void>;
    tokensCache: TokensCacheService;
    wallet: WalletService;
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
        multipleSwapTokenRoot,
        safeAmount,
        tip3ToCoinAddress,
        tokensCache,
        wallet,
        wrapGas,
        wrappedCoinVaultAddress,
    } = props

    if (wallet === undefined) {
        throw new Error('Ever Wallet Service not being passed in props')
    }

    if (tokensCache === undefined) {
        throw new Error('Tokens Cache Service not being passed in props')
    }

    const callbacks = useNotifiedCallbacks(props)

    const options = React.useMemo(() => ({
        ...callbacks,
        coinToTip3Address,
        comboToTip3Address,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
        minTvlValue,
        multipleSwapTokenRoot,
        safeAmount,
        tip3ToCoinAddress,
        wrapGas,
        wrappedCoinVaultAddress,
    }), [
        callbacks,
        coinToTip3Address,
        comboToTip3Address,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
        minTvlValue,
        multipleSwapTokenRoot,
        safeAmount,
        tip3ToCoinAddress,
        wrapGas,
        wrappedCoinVaultAddress,
    ])

    const context = React.useMemo<SwapFormStore>(
        () => new SwapFormStore(wallet, tokensCache, { ...options }),
        [options],
    )

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => tokensCache.isReady,
            async isReady => {
                context.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await beforeInit?.(context)
                        await context.init()
                    }
                    catch (e) {
                        error('Swap Form Store initializing error', e)
                    }
                    finally {
                        context.setState('isPreparing', false)
                    }
                }
            },
            { delay: 50, fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            context.dispose().catch(reason => error(reason))
        }
    }, [context])

    return (
        <SwapFormStoreContext.Provider value={context}>
            {children}
        </SwapFormStoreContext.Provider>
    )
}

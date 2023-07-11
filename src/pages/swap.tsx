import * as React from 'react'
import { IReactionDisposer, reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { Address } from 'everscale-inpage-provider'

import {
    DexRootAddress,
    EverToTip3Address,
    EverWeverToTip3Address,
    SafeAmount,
    Tip3ToEverAddress,
    USDTRootAddress,
    WEVERRootAddress,
    WeverVaultAddress,
    WrapGas,
} from '@/config'
import { Swap } from '@/modules/Swap'
import { SwapFormStoreProvider } from '@/modules/Swap/context'
import { SwapFormStore } from '@/modules/Swap/stores/SwapFormStore'
import { SwapStats, SwapBanner } from '@/modules/Swap/components'
import { SwapGraphStoreProvider } from '@/modules/Swap/context/SwapGraphStoreContext'
import { debug, storage } from '@/utils'
import { SwapGraphStore } from '@/modules/Swap/stores/SwapGraphStore'
import { SwapTransactions } from '@/pages/swap-transactions'
import { DexUtils } from '@/misc/utils/DexUtils'
import { LocalStorageSwapAmounts, Token } from '@/misc'
import { SwapDirection } from '@/modules/Swap/types'
import { SwapPoolStoreProvider } from '@/modules/Swap/context/SwapPoolStoreProvider'

import './swap.scss'

export default function Page(): JSX.Element {
    const swapFormStore = React.useRef<SwapFormStore>()
    const graphStore = React.useRef<SwapGraphStore>()
    const tokensDisposer = React.useRef<IReactionDisposer>()
    const getExpectedPoolAddressDisposer = React.useRef<IReactionDisposer>()

    const beforeInit = async (store: SwapFormStore): Promise<void> => {
        swapFormStore.current = store
        const amountsStorage = storage.get('amounts')
        if (amountsStorage) {
            const amounts: LocalStorageSwapAmounts = JSON.parse(amountsStorage)
            debug('amounts', amounts)
            if (amounts.side === SwapDirection.LTR) {
                store.setData('leftAmount', amounts?.leftAmount ?? '')
            }
            else if (amounts.side === SwapDirection.RTL) {
                store.setData('rightAmount', amounts?.rightAmount ?? '')
            }
        }
        tokensDisposer.current = reaction(
            () => [store.leftToken, store.rightToken],
            (
                [leftToken, rightToken]: (Token | undefined)[],
                [prevLeftToken, prevRightToken]: (Token | undefined)[],
            ) => {
                if (!leftToken || !rightToken) return
                if ((prevLeftToken?.root !== leftToken.root
                    || prevRightToken?.root !== rightToken.root)
                    || graphStore.current?.leftToken === undefined
                    || graphStore.current?.rightToken === undefined
                ) {
                    graphStore.current?.setState('isToggling', true)
                    graphStore.current?.setTokens(leftToken, rightToken)
                }
            },
        )
    }

    React.useEffect(() => () => {
        tokensDisposer.current?.()
        swapFormStore.current?.dispose?.()
        graphStore.current?.dispose?.()
        getExpectedPoolAddressDisposer.current?.()
    }, [])

    return (
        <div className="container container--large">
            <SwapBanner />
            <div className="swap__container">

                <SwapGraphStoreProvider
                    beforeInit={async store => {
                        graphStore.current = store
                    }}
                >
                    <Observer>
                        {() => (
                            <div className="swap__content visible@m">
                                <SwapStats />
                            </div>
                        )}
                    </Observer>

                </SwapGraphStoreProvider>
                <SwapFormStoreProvider
                    coinToTip3Address={EverToTip3Address}
                    comboToTip3Address={EverWeverToTip3Address}
                    defaultLeftTokenAddress={WEVERRootAddress.toString()}
                    defaultRightTokenAddress={USDTRootAddress.toString()}
                    minTvlValue="50000"
                    safeAmount={SafeAmount}
                    tip3ToCoinAddress={Tip3ToEverAddress}
                    wrapGas={WrapGas}
                    wrappedCoinTokenAddress={WEVERRootAddress}
                    wrappedCoinVaultAddress={WeverVaultAddress}
                    beforeInit={beforeInit}
                >
                    <Swap />
                </SwapFormStoreProvider>
            </div>

            <SwapPoolStoreProvider beforeInit={async store => {
                getExpectedPoolAddressDisposer.current = reaction(
                    () => [swapFormStore?.current?.leftToken, swapFormStore?.current?.rightToken],
                    (
                        [leftToken, rightToken]: (Token | undefined)[],
                        [prevLeftToken, prevRightToken]: (Token | undefined)[],
                    ) => {
                        if (!leftToken || !rightToken) return
                        if (
                            prevLeftToken?.root !== leftToken.root
                            || prevRightToken?.root !== rightToken.root
                            || !store?.poolAddress
                        ) {
                            DexUtils.getExpectedPoolAddress(
                                DexRootAddress,
                                [leftToken.root, rightToken.root],
                            )
                                .then(async (poolAddress: Address) => {
                                    store.setData('address', poolAddress.toString())
                                    debug('+++poolAddress', poolAddress.toString(), store.address)
                                })
                                .catch(debug)
                        }
                    },
                )
            }}
            >
                <SwapTransactions />
            </SwapPoolStoreProvider>
        </div>
    )
}

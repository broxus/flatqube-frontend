import * as React from 'react'
import { IReactionDisposer, reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { Address } from 'everscale-inpage-provider'
import { useIntl } from 'react-intl'

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
import { SectionTitle } from '@/components/common/SectionTitle'
import { Tabs } from '@/components/common/Tabs'
import { Checkbox } from '@/components/common/Checkbox'
import { SwapDirection } from '@/modules/Swap/types'
import { SwapTransactionsListPlaceholder } from '@/modules/Swap/components/SwapPoolTransactions/components/TransactionsListPlaceholder'
import { SwapPoolStoreProvider } from '@/modules/Swap/context/SwapPoolStoreProvider'

import './swap.scss'

export default function Page(): JSX.Element {
    const swapStore = React.useRef<SwapFormStore>()
    const graphStore = React.useRef<SwapGraphStore>()
    const tokensDisposer = React.useRef<IReactionDisposer>()
    const [address, setAddress] = React.useState<Address | undefined>()
    const intl = useIntl()

    const beforeInit = async (store: SwapFormStore): Promise<void> => {
        swapStore.current = store
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
                debug(
                    'leftToken && rightToken',
                    leftToken?.symbol,
                    rightToken?.symbol,
                    (leftToken && rightToken)
                    && (prevLeftToken?.root !== leftToken.root
                        || prevRightToken?.root !== rightToken.root),
                    graphStore.current?.leftToken?.root,
                    graphStore.current?.rightToken?.root,
                    graphStore.current?.leftToken?.root,
                    graphStore.current?.rightToken?.root,
                    {
                        leftToken: leftToken?.root,
                        prevLeftToken: prevLeftToken?.root,
                        prevRightToken: prevRightToken?.root,
                        rightToken: rightToken?.root,
                    },
                )
                if (!leftToken || !rightToken) return
                if ((prevLeftToken?.root !== leftToken.root
                    || prevRightToken?.root !== rightToken.root)
                    || graphStore.current?.leftToken === undefined
                    || graphStore.current?.rightToken === undefined
                ) {
                    graphStore.current?.setState('isToggling', true)
                    graphStore.current?.setTokens(leftToken, rightToken)
                    DexUtils.getExpectedPoolAddress(
                        DexRootAddress,
                        [leftToken.root, rightToken.root],
                    )
                        .then((poolAddress: Address) => {
                            debug('poolAddress', poolAddress)
                            setAddress(poolAddress)
                        })
                        .catch(debug)
                }
            },
        )
    }

    React.useEffect(() => () => {
        tokensDisposer.current?.()
        swapStore.current?.dispose?.()
        graphStore.current?.dispose?.()
    }, [])

    return (
        <div className="container container--large">
            <SwapBanner />
            <div className="swap__container">

                <SwapGraphStoreProvider
                    beforeInit={async store => {
                        graphStore.current = store
                        debug('graphStore.current', graphStore.current)
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
                    // referrer={SwapReferrerAddress.toString()}
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
            {address
                ? (
                    <SwapPoolStoreProvider address={address.toString()}>
                        <SwapTransactions />
                    </SwapPoolStoreProvider>
                )
                : (
                    <div style={({ marginTop: '64px' })}>
                        <section className="section">
                            <header className="section__header">
                                <SectionTitle size="small">
                                    {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_TITLE' })}
                                </SectionTitle>
                            </header>
                            <div className="transactions_list__toolbar">
                                <Tabs
                                    items={[{
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_ALL' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_SWAPS' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_DEPOSITS' }),
                                        onClick: () => undefined,
                                    }, {
                                        active: false,
                                        label: intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_EVENT_FILTER_WITHDRAWS' }),
                                        onClick: () => undefined,
                                    }]}
                                />
                                <Checkbox
                                    checked={false}
                                    label={intl.formatMessage({
                                        id: 'POOL_TRANSACTIONS_LIST_USER_ONLY_FILTER_CHECKBOX_LABEL',
                                    })}
                                />
                            </div>
                            <div className="card card--flat card--xsmall">
                                <div className="list transactions_list">
                                    <SwapTransactionsListPlaceholder />
                                </div>
                            </div>
                        </section>
                    </div>
                )}
        </div>
    )
}

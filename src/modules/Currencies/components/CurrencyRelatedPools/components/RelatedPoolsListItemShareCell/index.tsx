import * as React from 'react'
import BigNumber from 'bignumber.js'
import { reaction } from 'mobx'

import { Placeholder } from '@/components/common/Placeholder'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { TokenUtils, TokenWalletUtils } from '@/misc'
import type { PoolResponse } from '@/modules/Pools/types'
import { useCurrencyStoreContext } from '@/modules/Currencies/providers'
import { abbrNumber, formattedAmount, formattedTokenAmount } from '@/utils'

type Props = {
    pool: PoolResponse;
}

export function RelatedPoolsListItemShareCell({ pool }: Props): JSX.Element {
    const forceUpdate = useForceUpdate()

    const currencyStore = useCurrencyStoreContext()

    const lpToken = React.useRef(currencyStore.tokensCache.get(pool.meta.lpAddress))

    const [isFetching, setFetching] = React.useState<boolean>()
    const [userBalance, setUserBalance] = React.useState('0')

    const userShare = React.useMemo(() => {
        if (new BigNumber(pool.lpLocked).eq(0)) {
            return '0'
        }
        if (new BigNumber(userBalance || 0).eq(pool.lpLocked ?? 0)) {
            return '100'
        }
        return new BigNumber(userBalance || 0)
            .div(parseInt(pool.lpLocked ?? '0', 10) || 1)
            .times(100)
            .toFixed()
    }, [userBalance])

    React.useEffect(() => reaction(() => currencyStore.wallet.address, async (address, prevAddress) => {
        if (address !== undefined && address !== prevAddress && !isFetching) {
            try {
                setFetching(true)
                forceUpdate()

                lpToken.current = lpToken.current || await TokenUtils.getDetails(pool.meta.lpAddress)

                const balance = await TokenWalletUtils.balance({
                    tokenRootAddress: pool.meta.lpAddress,
                    walletOwnerAddress: address,
                })

                setUserBalance(balance)
            }
            catch (e) {

            }
            finally {
                setFetching(false)
            }
        }
        else {
            setUserBalance('0')
            setFetching(false)
            forceUpdate()
        }
    }, { fireImmediately: true }), [])

    const [formattedUserBalance, formattedUserBalanceAbbr] = abbrNumber(
        new BigNumber(userBalance).shiftedBy(-(lpToken.current?.decimals ?? 0)).toFixed(),
    )

    return (
        <div className="list__cell list__cell--right">
            {/* eslint-disable-next-line no-nested-ternary */}
            {(isFetching === undefined || isFetching)
                ? (
                    <>
                        <Placeholder height={20} width={80} />
                        <div className="visible@s">
                            <Placeholder height={18} width={40} />
                        </div>
                    </>
                )
                : currencyStore.wallet.address !== undefined
                    ? (
                        <>
                            <div className="list__cell-inner" style={{ gap: 0, justifyContent: 'flex-end' }}>
                                <span className="text-muted text-sm hidden@s">
                                    {`${formattedAmount(userShare)}%`}
                                    &nbsp;
                                    &nbsp;
                                </span>
                                {`${formattedTokenAmount(formattedUserBalance, undefined, {
                                    precision: 2,
                                })}${formattedUserBalanceAbbr}`}
                                <span className="text-truncate truncate-name">LP</span>
                            </div>
                            <div className="text-muted text-sm visible@s">{`${formattedAmount(userShare)}%`}</div>
                        </>
                    )
                    : <>&mdash;</>}
        </div>
    )
}

import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import { formattedTokenAmount, makeArray, uniqueId } from '@/utils'


export function AddLiquidityPoolData(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()

    return (
        <Observer>
            {() => {
                const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                return (
                    <div className="form-rows">
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_SUBTITLE_CURRENT_STATE',
                                })}
                            </div>
                        </div>
                        {isSyncingPool ? makeArray(3, uniqueId).map(key => (
                            <div key={key} className="form-row">
                                <Placeholder height={20} width={80} />
                                <Placeholder height={20} width={80} />
                            </div>
                        )) : formStore.tokens.map(token => (
                            <div key={token.address.toString()} className="form-row">
                                <div>{token.symbol}</div>
                                <div>{formattedTokenAmount(token.balance, token.decimals)}</div>
                            </div>
                        ))}
                        <div className="form-row">
                            <div>
                                {intl.formatMessage({
                                    id: 'LIQUIDITY_ADD_DATA_LABEL_LP_SUPPLY',
                                })}
                            </div>
                            <div>
                                {isSyncingPool ? (
                                    <Placeholder height={20} width={80} />
                                ) : formattedTokenAmount(formStore.pool?.lp.balance, formStore.pool?.lp.decimals)}
                            </div>
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}

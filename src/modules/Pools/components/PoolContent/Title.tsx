import * as React from 'react'
import { useIntl } from 'react-intl'

import { PairIcons } from '@/components/common/PairIcons'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'
import { concatSymbols } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

type Props = {
    poolContent: PoolContent
}

export function PoolTitle({
    poolContent,
}: Props): JSX.Element {
    const intl = useIntl()
    const { leftToken, rightToken } = poolContent

    if (!leftToken && !rightToken) {
        return (
            <div className="pools-pair-title">
                <Placeholder circle width={32} />
                <h2 className="section-title">
                    <Placeholder width={200} />
                </h2>
            </div>
        )
    }

    return (
        <div className="pools-pair-title">
            <PairIcons
                leftToken={leftToken}
                rightToken={rightToken}
            />
            <h2 className="section-title">
                {concatSymbols(
                    leftToken?.symbol,
                    rightToken?.symbol,
                )}
                {' '}
                {intl.formatMessage({
                    id: 'POOLS_LIST_ITEM_TITLE',
                })}
            </h2>
        </div>
    )
}

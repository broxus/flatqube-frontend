import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { Item } from '@/modules/Pairs/components/PairsList/Item'
import { PairInfo, PairsOrdering } from '@/modules/Pairs/types'
import { Placeholder } from '@/modules/Pairs/components/PairsList/Placeholder'
import { PanelLoader } from '@/components/common/PanelLoader'

import './index.scss'


type Props = {
    isLoading: boolean;
    offset: number;
    ordering: PairsOrdering | undefined;
    pairs: PairInfo[];
    onSwitchOrdering: (value: PairsOrdering) => void;
}


export function PairsList({
    isLoading,
    offset = 0,
    ordering,
    pairs,
    onSwitchOrdering,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="pairs-list list">
            <div className="list__header">
                <div className="list__cell list__cell--left visible@s">#</div>
                <div className="list__cell list__cell--left">
                    {intl.formatMessage({
                        id: 'PAIRS_LIST_HEADER_PAIR_CELL',
                    })}
                </div>
                <div className="list__cell list__cell--right">
                    <OrderingSwitcher<PairsOrdering>
                        ascending="volume24hascending"
                        descending="volume24hdescending"
                        value={ordering}
                        onSwitch={onSwitchOrdering}
                    >
                        {intl.formatMessage({
                            id: 'PAIRS_LIST_HEADER_VOLUME24_CELL',
                        })}
                    </OrderingSwitcher>
                </div>
                <div className="list__cell list__cell--right visible@s">
                    <OrderingSwitcher<PairsOrdering>
                        ascending="volume7dascending"
                        descending="volume7ddescending"
                        value={ordering}
                        onSwitch={onSwitchOrdering}
                    >
                        {intl.formatMessage({
                            id: 'PAIRS_LIST_HEADER_VOLUME7_CELL',
                        })}
                    </OrderingSwitcher>
                </div>
                <div className="list__cell list__cell--right visible@s">
                    <OrderingSwitcher<PairsOrdering>
                        ascending="tvlascending"
                        descending="tvldescending"
                        value={ordering}
                        onSwitch={onSwitchOrdering}
                    >
                        {intl.formatMessage({
                            id: 'PAIRS_LIST_HEADER_TVL_CELL',
                        })}
                    </OrderingSwitcher>
                </div>
            </div>

            {isLoading && pairs.length === 0 ? (
                [...Array(10).keys()].map(() => (
                    <Placeholder />
                ))
            ) : (
                <PanelLoader loading={isLoading && pairs.length > 0}>
                    {pairs.map((pair, idx) => (
                        <Item
                            key={pair.meta.poolAddress}
                            pair={pair}
                            idx={offset + idx + 1}
                        />
                    ))}
                </PanelLoader>
            )}
        </div>
    )
}

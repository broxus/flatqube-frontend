import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'
import BigNumber from 'bignumber.js'

import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { appRoutes } from '@/routes'
import { TokenIcons } from '@/components/common/TokenIcons'
import { formattedAmount } from '@/utils'
import { RateChange } from '@/components/common/RateChange'
import { UnlockedReward } from '@/modules/Gauges/components/GaugesList/UnlockedReward'
import { LockedReward } from '@/modules/Gauges/components/GaugesList/LockedReward'
import { Share } from '@/modules/Gauges/components/GaugesList/Share'
import { Icon } from '@/components/common/Icon'
import { Tooltip } from '@/components/common/Tooltip'
import { GaugeItem } from '@/modules/Gauges/api/models'
import { Status } from '@/modules/Gauges/components/GaugesList/Status'

import styles from './index.module.scss'


type Props = {
    item: GaugeItem;
}

function GaugesListItemInner({
    item,
}: Props): JSX.Element {
    const intl = useIntl()
    const tokens = useContext(GaugesTokensContext)
    const lowBalanceRef = React.useRef<HTMLDivElement>(null)

    return (
        <div className="list__row" key={item.address}>
            <div className="list__cell list__cell--left">
                <div className={styles.gauge}>
                    <Status
                        gaugeId={item.address}
                    />

                    <TokenIcons
                        icons={item.poolTokens.map(poolToken => ({
                            address: poolToken.tokenRoot,
                            icon: tokens.byRoot[poolToken.tokenRoot]?.icon,
                            name: poolToken.tokenSymbol,
                        }))}
                    />

                    <Link
                        to={appRoutes.gaugesItem.makeUrl({
                            address: item.address,
                        })}
                    >
                        {item.poolTokens.map(poolToken => poolToken.tokenSymbol).join('/')}
                    </Link>

                    {item.isLowBalance && (
                        <>
                            <div ref={lowBalanceRef}>
                                <Icon icon="warning" />
                            </div>
                            <Tooltip target={lowBalanceRef}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: intl.formatMessage({
                                            id: 'GAUGE_PAIR_WARNING_TOOLTIP',
                                        }),
                                    }}
                                />
                            </Tooltip>
                        </>
                    )}
                </div>
            </div>
            <div className="list__cell list__cell--left">
                {item.rewardTokens.length === 0 ? (
                    '—'
                ) : (
                    <TokenIcons
                        showDesc
                        limit={4}
                        title={intl.formatMessage({ id: 'GAUGE_TABLE_REWARDS_TITLE' })}
                        icons={item.rewardTokens.map(rewardToken => ({
                            address: rewardToken.tokenRoot,
                            icon: tokens.byRoot[rewardToken.tokenRoot]?.icon,
                            name: rewardToken.tokenSymbol,
                        }))}
                    />
                )}
            </div>
            <div className="list__cell list__cell--right">
                <div>
                    $
                    {formattedAmount(item.tvl)}
                </div>
                <RateChange
                    size="sm"
                    value={new BigNumber(item.tvlChange).decimalPlaces(2).toFixed()}
                />
            </div>
            <div className="list__cell list__cell--right">
                <div>
                    {formattedAmount(item.minApr)}
                    %
                </div>
                <RateChange
                    size="sm"
                    value={new BigNumber(item.minAprChange).decimalPlaces(2).toFixed()}
                />
            </div>
            <div className="list__cell list__cell--right">
                <div>
                    {formattedAmount(item.maxApr)}
                    %
                </div>
                <RateChange
                    size="sm"
                    value={new BigNumber(item.maxAprChange).decimalPlaces(2).toFixed()}
                />
            </div>
            <div className="list__cell list__cell--right">
                <Share gaugeId={item.address} />
            </div>
            <div className="list__cell list__cell--right">
                <UnlockedReward gaugeId={item.address} />
            </div>
            <div className="list__cell list__cell--right">
                <LockedReward gaugeId={item.address} />
            </div>
        </div>
    )
}

export const GaugesListItem = observer(GaugesListItemInner)

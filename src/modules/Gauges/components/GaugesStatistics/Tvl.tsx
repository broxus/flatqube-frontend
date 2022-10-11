import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedAmount, formattedTokenAmount } from '@/utils'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'

import styles from './index.module.scss'

function StatisticsTvlInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const { poolTokensAmount } = data

    if (data.rootToken && data.rootTokenBalance && data.rootTokenBalanceUSDT) {
        return (
            <GaugesPanel className={styles.tvl}>
                <div className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_STATISTICS_TVL',
                    })}
                </div>

                <div className={styles.amount}>
                    $
                    {formattedAmount(data.rootTokenBalanceUSDT)}
                </div>

                {poolTokensAmount && data.poolTokens && data.poolTokens.length > 1 ? (
                    <GaugesTokens
                        items={data.poolTokens.map((token, index) => ({
                            amount: formattedTokenAmount(poolTokensAmount[index], token.decimals),
                            token,
                        }))}
                    />
                ) : undefined}

                <GaugesTokens
                    items={[{
                        label: `${formattedTokenAmount(data.rootTokenBalance, data.rootToken.decimals)} LP`,
                        token: data.rootToken,
                    }]}
                />
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.tvl}>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <div className={styles.amount}>
                <Placeholder width={100} />
            </div>
        </GaugesPanel>
    )
}

export const StatisticsTvl = observer(StatisticsTvlInner)

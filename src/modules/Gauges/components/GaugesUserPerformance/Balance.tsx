import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { useContext } from '@/hooks/useContext'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import {
    formatDate, formattedAmount, formattedTokenAmount, shareAmount,
} from '@/utils'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesDropdown } from '@/modules/Gauges/components/GaugesDropdown'
import { GaugesUserPerformanceContext } from '@/modules/Gauges/providers/GaugesUserPerformanceProvider'
import { BalanceType } from '@/modules/Gauges/stores/GaugesUserPerformanceStore'
import { DropdownList } from '@/modules/Gauges/components/GaugesDropdown/List'
import { Icon } from '@/components/common/Icon'
import { Tooltip } from '@/components/common/Tooltip'

import styles from './index.module.scss'

const balanceTitleMap = new Map([
    [BalanceType.All, 'GAUGE_BALANCE_ALL'],
    [BalanceType.Unlocked, 'GAUGE_BALANCE_UNLOCKED'],
    [BalanceType.Locked, 'GAUGE_BALANCE_LOCKED'],
])

function UserPerformanceBalanceInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const userPerformance = useContext(GaugesUserPerformanceContext)
    const infoRef = React.useRef<HTMLSpanElement>(null)
    const { poolTokensAmount, rootTokenBalance } = data

    const historyLpBreakdown = React.useMemo(
        () => userData.historyBalance?.lpBreakdown
            .reduce<{[k: string]: string}>((acc, item) => ({
                ...acc,
                [item.tokenRoot]: item.amount,
            }), {}),
        [userData.historyBalance],
    )

    const info = React.useMemo(
        () => (userData.historyBalance?.lastUpdated ? (
            <>
                <h4>
                    {intl.formatMessage({
                        id: 'GAUGE_HISTORY_BALANCE',
                    })}
                </h4>
                <p>
                    {intl.formatMessage({
                        id: 'GAUGE_HISTORY_LAST_UPDATE',
                    }, {
                        date: formatDate(userData.historyBalance.lastUpdated * 1000),
                    })}
                </p>
            </>
        ) : undefined),
        [userData.historyBalance],
    )

    if (
        data.rootToken
        && userData.balance
        && userData.withdrawBalance
        && userData.lockedBalance
        && userData.balanceUSDT
        && userData.withdrawBalanceUSDT
        && userData.lockedBalanceUSDT
        && !userData.balanceIsLoading
    ) {
        let balance: string,
            balanceUSDT: string
        switch (userPerformance.balanceType) {
            case BalanceType.Locked:
                balance = userData.lockedBalance
                balanceUSDT = userData.lockedBalanceUSDT
                break
            case BalanceType.Unlocked:
                balance = userData.withdrawBalance
                balanceUSDT = userData.withdrawBalanceUSDT
                break
            default:
                balance = userData.balance
                balanceUSDT = userData.balanceUSDT
                break
        }

        return (
            <GaugesPanel className={styles.balance}>
                <h3 className={classNames(styles.title, styles.space)}>
                    {intl.formatMessage({
                        id: 'GAUGE_BALANCE',
                    })}

                    <GaugesDropdown
                        color="light"
                        minWidth={190}
                        content={(
                            <DropdownList
                                items={[{
                                    active: userPerformance.balanceType === BalanceType.All,
                                    label: intl.formatMessage({
                                        id: 'GAUGE_BALANCE_ALL',
                                    }),
                                    onClick: userPerformance.setAllBalance,
                                }, {
                                    active: userPerformance.balanceType === BalanceType.Unlocked,
                                    label: intl.formatMessage({
                                        id: 'GAUGE_BALANCE_UNLOCKED',
                                    }),
                                    onClick: userPerformance.setUnlocked,
                                }, {
                                    active: userPerformance.balanceType === BalanceType.Locked,
                                    label: intl.formatMessage({
                                        id: 'GAUGE_BALANCE_LOCKED',
                                    }),
                                    onClick: userPerformance.setLocked,
                                }]}
                            />
                        )}
                    >
                        {intl.formatMessage({
                            id: balanceTitleMap.get(userPerformance.balanceType),
                        })}
                    </GaugesDropdown>
                </h3>

                <div className={styles.history}>
                    <div className={styles.amount}>
                        <div className={styles.value}>
                            $
                            {formattedAmount(balanceUSDT)}
                        </div>
                    </div>

                    {userPerformance.balanceType === BalanceType.All
                        && !!userData.historyBalance
                        && !!userData.historyBalance.lastUpdated
                        && (
                            <div className={classNames(styles.amount, styles.extra)}>
                                <div className={styles.value}>
                                    $
                                    {formattedAmount(userData.historyBalance.balance)}
                                </div>

                                <span ref={infoRef}>
                                    <Icon
                                        className={styles.icon}
                                        icon="infoFill"
                                    />
                                </span>

                                <Tooltip
                                    alignY="top"
                                    alignX="left"
                                    target={infoRef}
                                >
                                    {info}
                                </Tooltip>
                            </div>
                        )}
                </div>

                {
                    poolTokensAmount
                    && balance
                    && rootTokenBalance
                    && data.poolTokens
                    && data.poolTokens.length > 1
                    && (
                        <GaugesTokens
                            items={data.poolTokens.map((token, index) => ({
                                amount: formattedTokenAmount(
                                    shareAmount(
                                        balance,
                                        poolTokensAmount[index],
                                        rootTokenBalance,
                                        token.decimals,
                                    ),
                                ),
                                extra: historyLpBreakdown
                                    && historyLpBreakdown[token.root]
                                    && userPerformance.balanceType === BalanceType.All
                                    ? `${formattedTokenAmount(historyLpBreakdown[token.root])} ${token.symbol}`
                                    : undefined,
                                info: userPerformance.balanceType === BalanceType.All ? info : undefined,
                                token,
                            }))}
                        />
                    )
                }

                <GaugesTokens
                    items={[{
                        extra: historyLpBreakdown
                            && historyLpBreakdown[data.rootToken.root]
                            && userPerformance.balanceType === BalanceType.All
                            ? `${formattedTokenAmount(historyLpBreakdown[data.rootToken.root])} LP`
                            : undefined,
                        info: userPerformance.balanceType === BalanceType.All ? info : undefined,
                        label: `${formattedTokenAmount(balance, data.rootToken.decimals)} LP`,
                        token: data.rootToken,
                    }]}
                />

                {userData.share && (
                    <div className={styles.share}>
                        <Icon icon="share" />
                        <span>
                            {formattedAmount(userData.share)}
                            %
                            {' '}
                            {intl.formatMessage({
                                id: 'GAUGE_SHARE_DESC',
                            })}
                        </span>
                    </div>
                )}
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.balance}>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <div className={styles.amount}>
                <Placeholder width={100} />
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceBalance = observer(UserPerformanceBalanceInner)

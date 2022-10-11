import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

export function QubeDaoUserBalances(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <section className="section">
            <div className={styles.balance__user_balances}>
                <div className="card card--flat card--xsmall">
                    <div className={styles.balance__user_balance_term}>
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_BALANCE_USER_VOTING_WEIGHT_TERM' },
                            { symbol: daoContext.veSymbol },
                        )}
                    </div>
                    <div className={styles.balance__user_balance_value}>
                        <Observer>
                            {() => ((daoContext.isSyncingBalances || daoContext.isSyncingBalances === undefined) ? (
                                <Placeholder height={26} width={100} />
                            ) : (
                                <TokenAmountBadge
                                    amount={formattedTokenAmount(
                                        daoContext.userVeBalance || 0,
                                        daoContext.veDecimals,
                                    )}
                                    icon={daoContext.veIcon}
                                    size="small"
                                />
                            ))}
                        </Observer>
                    </div>
                </div>

                <div className="card card--flat card--xsmall">
                    <div className={styles.balance__user_balance_term}>
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_BALANCE_USER_LOCKED_TERM' },
                            { symbol: daoContext.tokenSymbol },
                        )}
                    </div>
                    <div className={styles.balance__user_balance_value}>
                        <Observer>
                            {() => ((daoContext.isSyncingBalances || daoContext.isSyncingBalances === undefined) ? (
                                <Placeholder height={26} width={100} />
                            ) : (
                                <TokenAmountBadge
                                    address={daoContext.tokenAddress.toString()}
                                    amount={formattedTokenAmount(
                                        daoContext.userBalance || 0,
                                        daoContext.tokenDecimals,
                                    )}
                                    icon={daoContext.token?.icon}
                                    size="small"
                                />
                            ))}
                        </Observer>
                    </div>
                </div>
            </div>
        </section>
    )
}

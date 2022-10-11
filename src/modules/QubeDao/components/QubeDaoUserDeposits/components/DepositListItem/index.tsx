import * as React from 'react'

import { endsIn } from '@/components/common/EndsIn'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { StatusCell } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/StatusCell'
import { LockPeriodCell } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/LockPeriodCell'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { QubeDaoDepositResponse } from '@/modules/QubeDao/types'
import { formattedTokenAmount, isTimeExpired } from '@/utils'

type Props = {
    deposit: QubeDaoDepositResponse;
}

export function DepositListItem({ deposit }: Props): JSX.Element {
    const daoContext = useQubeDaoContext()

    const forceUpdate = useForceUpdate()

    const interval = React.useRef<ReturnType<typeof setInterval>>()
    const isLocked = React.useRef(deposit.isLocked)

    React.useEffect(() => {
        interval.current = setInterval(() => {
            isLocked.current = !isTimeExpired(deposit.transactionTime + deposit.lockTime)
            forceUpdate()
        }, 15000)
        return () => {
            clearInterval(interval.current)
        }
    }, [deposit.key])

    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <TransactionExplorerLink id={deposit.transactionHash}>
                    {`${formattedTokenAmount(
                        deposit.veAmount || 0,
                        daoContext.veDecimals,
                    )} ${daoContext.veSymbol}`}
                </TransactionExplorerLink>
            </div>
            <div className="list__cell list__cell--left">
                <TransactionExplorerLink id={deposit.transactionHash}>
                    {`${formattedTokenAmount(
                        deposit.amount,
                        daoContext.tokenDecimals,
                    )} ${daoContext.tokenSymbol}`}
                </TransactionExplorerLink>
            </div>
            <div className="list__cell list__cell--right">
                <StatusCell isLocked={isLocked.current} />
            </div>
            <div className="list__cell list__cell--right">
                <LockPeriodCell
                    end={deposit.transactionTime + deposit.lockTime}
                    start={deposit.transactionTime}
                />
            </div>
            <div className="list__cell list__cell--right">
                {endsIn({ end: deposit.transactionTime + deposit.lockTime })}
            </div>
        </div>
    )
}

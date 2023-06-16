import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { formattedTokenAmount, isMobile } from '@/utils'
import { LimitOrderCancelCallbackResult } from '@/modules/LimitOrders/types'


export function OrderStateCancelled({
    result: {
        spentToken,
        currentSpentTokenAmount,
    },
}: { result: LimitOrderCancelCallbackResult }): JSX.Element {
    const intl = useIntl()

    return (
        <>
            <div className="notification-body">
                <div className="notification_token-badge">
                    <TokenIcon
                        address={spentToken?.root}
                        icon={spentToken?.icon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            currentSpentTokenAmount,
                            spentToken?.decimals,
                            { preserve: true },
                        )} ${spentToken?.symbol}`}
                    </div>
                </div>
            </div>

            {(spentToken?.root !== undefined) && (
                <div
                    className={classNames('notification-actions', {
                        'notification-actions--large': isMobile(navigator.userAgent),
                    })}
                >
                    {spentToken?.root !== undefined && (
                        <AccountExplorerLink
                            address={spentToken?.root}
                            className={isMobile(navigator.userAgent) ? 'btn btn-link' : 'btn btn-secondary'}
                        >
                            {intl.formatMessage({ id: 'SWAP_NOTIFICATION_RECEIPT_TOKEN_ROOT_CONTRACT_LINK_TEXT' })}
                        </AccountExplorerLink>
                    )}
                </div>
            )}
        </>
    )
}

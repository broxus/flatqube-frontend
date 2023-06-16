import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TokenIcon } from '@/components/common/TokenIcon'
import { LimitOrderExchangeSuccessCallbackResult } from '@/modules/LimitOrders/types'
import { formattedTokenAmount, isMobile } from '@/utils'
// import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'


export function OrderExchangeSuccess({
    result: {
        spentToken,
        spentAmount,
        receiveToken,
        receiveAmount,
        // currentSpentTokenAmount,
        // currentReceiveTokenAmount,
        // fee,
    },
}: { result: LimitOrderExchangeSuccessCallbackResult }): JSX.Element {
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
                        {`- ${formattedTokenAmount(
                            spentAmount,
                            spentToken?.decimals,
                            { preserve: true },
                        )} ${spentToken?.symbol}`}
                    </div>
                    {/* {currentSpentTokenAmount ? (
                        <div className="notification_token-badge__title">
                            {`- ${formattedTokenAmount(
                                spentAmount,
                                spentToken?.decimals,
                                { preserve: true },
                            )} / ${formattedTokenAmount(
                                currentSpentTokenAmount,
                                spentToken?.decimals,
                                { preserve: true },
                            )} ${spentToken?.symbol}`}
                        </div>
                    )
                        : (
                            <div className="notification_token-badge__title">
                                {`- ${formattedTokenAmount(
                                    spentAmount,
                                    spentToken?.decimals,
                                    { preserve: true },
                                )} ${spentToken?.symbol}`}
                            </div>
                        )} */}
                </div>
                <div className="notification_token-badge">
                    <TokenIcon
                        address={receiveToken?.root}
                        icon={receiveToken?.icon}
                        size="small"
                    />
                    <div className="notification_token-badge__title">
                        {`+ ${formattedTokenAmount(
                            receiveAmount,
                            receiveToken?.decimals,
                            { preserve: true },
                        )} ${receiveToken?.symbol}`}
                    </div>
                    {/* {currentReceiveTokenAmount
                        ? (
                            <div className="notification_token-badge__title">
                                {`+ ${formattedTokenAmount(
                                    receiveAmount,
                                    receiveToken?.decimals,
                                    { preserve: true },
                                )} / ${formattedTokenAmount(
                                    currentReceiveTokenAmount,
                                    receiveToken?.decimals,
                                    { preserve: true },
                                )} ${receiveToken?.symbol}`}
                            </div>
                        )
                        : (
                            <div className="notification_token-badge__title">
                                {`+ ${formattedTokenAmount(
                                    receiveAmount,
                                    receiveToken?.decimals,
                                    { preserve: true },
                                )} ${receiveToken?.symbol}`}
                            </div>
                        )} */}
                </div>
                {/* <div className="notification_token-badge">
                    <TokenIcon
                        address={receiveToken?.root}
                        icon={receiveToken?.icon}
                        size="small"
                    />
                    {fee && (
                        <div className="notification_token-badge__title">
                            {`Fee: - ${formattedTokenAmount(
                                fee,
                                receiveToken?.decimals,
                                { preserve: true },
                            )}
                                ${receiveToken?.symbol}`}
                        </div>
                    )}
                </div> */}
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

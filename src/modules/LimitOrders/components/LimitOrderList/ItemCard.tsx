import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'

import { PairIcons } from '@/components/common/PairIcons'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { CardPrice } from '@/modules/LimitOrders/components/LimitOrderList/CardPrice'
import { ActionButton } from '@/modules/LimitOrders/components/LimitOrderList/ActionButton'
import { Token } from '@/misc'
import {
    LimitOrderExchangeItem, LimitOrderItem, OrderViewMode,
} from '@/modules/LimitOrders/types'
import { formattedTokenAmount } from '@/utils'
import { RelativeTime } from '@/components/common/RelativeTime'

type Props = {
    limitOrder: LimitOrderItem & LimitOrderExchangeItem;
    toggleOrderView: OrderViewMode;
    data: {
        spentToken?: Token;
        receiveToken?: Token;
        formatedSpentAmount: string;
        formatedReceiveAmount: string;
        selectedSpentAmount?: string;
        selectedReceiveAmount?: string;
    }
}

export function ItemCard({
    data: {
        spentToken,
        receiveToken,
        formatedSpentAmount,
        formatedReceiveAmount,
        selectedSpentAmount,
        selectedReceiveAmount,
    },
    limitOrder,
    limitOrder: {
        createdAt,
        expectedReceiveAmount,
        currentReceiveAmount,
        initialSpentAmount,
        currentSpentAmount,
    },
    toggleOrderView,
}: Props): JSX.Element {
    const intl = useIntl()
    const percent = new BigNumber(expectedReceiveAmount || '')
        .minus(new BigNumber(currentReceiveAmount || ''))
        .dividedBy(new BigNumber(expectedReceiveAmount || ''))
        .times(100)
        .dp(2, BigNumber.ROUND_DOWN)
    return (
        <div className="list__card">
            <div className="list-bill unset-max-width">
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        <PairIcons
                            leftToken={spentToken}
                            rightToken={receiveToken}
                            small
                        />
                        &nbsp;
                        <div className="list-bill__val text-bold" style={{ color: '#fff' }}>
                            {spentToken?.symbol}
                            /
                            {receiveToken?.symbol}
                        </div>
                    </div>

                </div>
                <Observer>
                    {() => (
                        <>
                            <div
                                className="list-bill__row"
                                style={{ alignItems: 'flex-start' }}
                            >
                                <div className="list-bill__info ">
                                    {intl.formatMessage({
                                        id: 'P2P_BILL_LABEL_RATE',
                                    })}
                                </div>
                                <div
                                    className="list-bill__val "
                                    style={{ height: 'auto' }}
                                >
                                    <CardPrice
                                        leftToken={receiveToken}
                                        rightToken={spentToken}
                                        leftAmount={selectedReceiveAmount}
                                        rightAmount={selectedSpentAmount}
                                    />
                                </div>
                            </div>
                            <div
                                className="list-bill__row"
                                style={{ alignItems: 'flex-start' }}
                            >
                                <div className="list-bill__info ">
                                    {intl.formatMessage({
                                        id: 'ORDER_LIST_HEADER_SELL_CELL',
                                    })}
                                </div>
                                <div
                                    className="list-bill__val "
                                    style={{ height: 'auto' }}
                                >
                                    <TokenAmountBadge
                                        address={spentToken?.root}
                                        amount={formatedSpentAmount}
                                        icon={spentToken?.icon}
                                        size="xsmall"
                                        symbol={spentToken?.symbol}
                                    />
                                </div>
                            </div>
                            <div
                                className="list-bill__row"
                                style={{ alignItems: 'flex-start' }}
                            >
                                <div className="list-bill__info ">
                                    {intl.formatMessage({
                                        id: 'ORDER_LIST_HEADER_BUY_CELL',
                                    })}
                                </div>
                                <div
                                    className="list-bill__val "
                                    style={{ height: 'auto' }}
                                >
                                    <TokenAmountBadge
                                        address={receiveToken?.root}
                                        amount={formatedReceiveAmount}
                                        icon={receiveToken?.icon}
                                        size="xsmall"
                                        symbol={receiveToken?.symbol}
                                    />
                                </div>
                            </div>
                            {toggleOrderView === OrderViewMode.ORDERS_HISTORY && (
                                <div
                                    className="list-bill__row"
                                    style={{ alignItems: 'flex-start' }}
                                >
                                    <div className="list-bill__info ">
                                        {intl.formatMessage({
                                            id: 'ORDER_LIST_HEADER_DATE',
                                        })}
                                    </div>
                                    <div
                                        className="list-bill__val "
                                        style={{ height: 'auto' }}
                                    >
                                        {createdAt
                                            && DateTime.fromSeconds(
                                                createdAt,
                                                { locale: intl.locale },
                                            ).toRelative()}
                                    </div>
                                </div>
                            )}

                            {toggleOrderView === OrderViewMode.MY_OPEN_ORDERS && (
                                <>
                                    <div
                                        className="list-bill__row"
                                        style={{ alignItems: 'flex-start' }}
                                    >
                                        <div className="list-bill__info ">
                                            {intl.formatMessage({
                                                id: 'ORDER_LIST_HEADER_CREATED',
                                            })}
                                        </div>
                                        <div
                                            className="list-bill__val "
                                            style={{ height: 'auto' }}
                                        >
                                            {createdAt
                                                && (
                                                    <RelativeTime
                                                        timestamp={createdAt * 1000}
                                                        locale={intl.locale}
                                                    />
                                                )}
                                        </div>
                                    </div>
                                    <div
                                        className="list-bill__row"
                                        style={{ alignItems: 'flex-start' }}
                                    >
                                        <div className="list-bill__info ">
                                            {intl.formatMessage({
                                                id: 'ORDER_LIST_HEADER_FILL',
                                            })}
                                        </div>
                                        <div
                                            className="list-bill__val "
                                            style={{ height: 'auto' }}
                                        >
                                            {' '}
                                            {formattedTokenAmount(
                                                new BigNumber(initialSpentAmount || '')
                                                    .minus(new BigNumber(currentSpentAmount || ''))
                                                    .toFixed(),
                                                spentToken?.decimals,
                                            )}
                                            /
                                            {formattedTokenAmount(new BigNumber(initialSpentAmount || '').toFixed(), spentToken?.decimals)}
                                            {' '}
                                            {spentToken?.symbol}
                                            {' '}
                                        </div>
                                    </div>
                                    <div
                                        className="list-bill__row"
                                        style={{ alignItems: 'flex-start' }}
                                    >
                                        <div className="list-bill__info ">
                                            {intl.formatMessage({
                                                id: 'ORDER_LIST_HEADER_FILL_PROCENT',
                                            })}
                                        </div>
                                        <div
                                            className="list-bill__val "
                                            style={{ height: 'auto' }}
                                        >

                                            {
                                                // eslint-disable-next-line no-nested-ternary
                                                percent.eq(0) ? '0' : percent.gt(0.01) ? `~${percent.toFixed()}` : '<0.01'
                                            }
                                            %
                                        </div>
                                    </div>
                                    <div
                                        className="list-bill__row"
                                        style={{ alignItems: 'flex-start' }}
                                    >
                                        <div />
                                        <div
                                            className="list-bill__val "
                                            style={{ height: 'auto' }}
                                        >
                                            <progress
                                                style={({ accentColor: '#4AB44A' })}
                                                max={100}
                                                value={new BigNumber(expectedReceiveAmount || '')
                                                    .minus(new BigNumber(currentReceiveAmount || ''))
                                                    .dividedBy(new BigNumber(expectedReceiveAmount || ''))
                                                    .times(100)
                                                    .dp(0, BigNumber.ROUND_HALF_DOWN)
                                                    .toFixed()}
                                            />
                                        </div>
                                    </div>
                                </>

                            )}
                        </>
                    )}
                </Observer>
                {toggleOrderView !== OrderViewMode.ORDERS_HISTORY
                    && (
                        <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                            <Observer>
                                {() => (
                                    <ActionButton limitOrder={limitOrder} />
                                )}
                            </Observer>
                        </div>
                    )}

            </div>
        </div>
    )
}

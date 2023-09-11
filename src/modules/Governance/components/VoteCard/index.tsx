import * as React from 'react'

import { formattedAmount } from '@/utils'
import { useWallet } from '@/stores/WalletService'

import './index.scss'

type Props = {
    value?: string;
    percent?: number;
}

export function VoteCard({
    value,
    percent,
}: Props): JSX.Element {
    const wallet = useWallet()

    return (
        <div className="vote-card">
            <div className="vote-card__value">
                {value
                    ? formattedAmount(value, wallet.coin.decimals)
                    : '–'}
            </div>
            {percent && (
                <div className="vote-card__percent">
                    {percent}
                    %
                </div>
            )}
        </div>
    )
}

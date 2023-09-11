/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable sort-keys */
/* eslint-disable no-nested-ternary */
import * as React from 'react'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { ContentLoader } from '@/components/common/ContentLoader'
import { Table } from '@/modules/Governance/components/Table'
import { UserCard } from '@/modules/Governance/components/UserCard'
import { ProgressBar } from '@/modules/Governance/components/ProgressBar'
import { VoteCard } from '@/modules/Governance/components/VoteCard'
import { useWallet } from '@/stores/WalletService'
import { formattedAmount } from '@/utils'

import './index.scss'

type Vote = {
    address: string;
    value: string;
    percent?: number;
}

type Props = {
    type: 1 | 0;
    value?: string;
    total?: string;
    percent?: number;
    votes: Vote[];
    loading?: boolean;
}

export function VotingPanel({
    type,
    value,
    total,
    percent,
    votes,
    loading,
}: Props): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

    const valueRounded = value
        ? new BigNumber(value)
            .shiftedBy(-wallet.coin.decimals)
            .dp(0, BigNumber.ROUND_DOWN)
            .toFixed()
        : undefined

    const scrollToAll = (e: React.FormEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const el = document.querySelector('#votes')
        if (el) el.scrollIntoView(true)
    }

    return (
        <div className="voting-panel card card--flat card--xsmall">
            <div className="voting-panel__head">
                <div className="voting-panel__title">
                    {intl.formatMessage({
                        id: type === 1 ? 'PROPOSALS_VOTE_1' : 'PROPOSALS_VOTE_0',
                    })}
                </div>
                <div className="voting-panel__value">
                    {valueRounded ? formattedAmount(valueRounded) : null}

                    {total && (
                        <span className="voting-panel__total">
                            {' '}
                            {intl.formatMessage({
                                id: 'VOTING_PANEL_TOTAL',
                            }, {
                                total: formattedAmount(
                                    total,
                                    wallet.coin.decimals,
                                ),
                            })}
                        </span>
                    )}
                </div>
            </div>

            <ProgressBar
                percent={percent}
                color={type === 1 ? 'green' : 'red'}
                className="voting-panel__progress"
            />

            {loading && (
                <div className="voting-panel__loading">
                    <ContentLoader slim />
                </div>
            )}

            {votes.length > 0 && (
                <>
                    <Table
                        className="voting-panel__table"
                        cols={[{
                            name: intl.formatMessage({
                                id: 'VOTING_PANEL_VOTER',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'VOTING_PANEL_VOTE',
                            }),
                            align: 'right',
                        }]}
                        rows={votes.map(vote => ({
                            cells: [
                                <UserCard address={vote.address} />,
                                <VoteCard
                                    value={vote.value}
                                    percent={vote.percent}
                                />,
                            ],
                        }))}
                    />

                    <div className="voting-panel__footer">
                        <a className="voting-panel__more" href="#votes" onClick={scrollToAll}>
                            {intl.formatMessage({
                                id: 'VOTING_PANEL_VIEW_ALL',
                            })}
                        </a>
                    </div>
                </>
            )}

            {votes.length === 0 && !loading && (
                <div className="voting-panel__empty">
                    {intl.formatMessage({
                        id: 'PROPOSAL_NO_VOTERS',
                    })}
                </div>
            )}
        </div>
    )
}

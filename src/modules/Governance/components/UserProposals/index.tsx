import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import {
    Actions, Header, Section, Title,
} from '@/modules/Governance/components/Section'
import { Table } from '@/modules/Governance/components/Table'
import { Pagination } from '@/components/common/Pagination'
import { VoteType } from '@/modules/Governance/components/VoteType'
import { ProposalSummary } from '@/modules/Governance/components/ProposalSummary'
import { ProposalStatus } from '@/modules/Governance/components/ProposalStatus'
import { ProposalProgress } from '@/modules/Governance/components/ProposalProgress'
import { DateCard } from '@/modules/Governance/components/DateCard'
import { ProposalsFilters } from '@/modules/Governance/components/ProposalsFilters'
import { UnlockButton } from '@/modules/Governance/components/UnlockButton'
import { UnlockAllButton } from '@/modules/Governance/components/UnlockAllButton'
import { ProposalsFilters as Filters } from '@/modules/Governance/types'
import { useProposalsFilters, useUserProposals, usePagination } from '@/modules/Governance/hooks'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { useWallet } from '@/stores/WalletService'
import { error, formattedAmount } from '@/utils'

import './index.scss'

export function UserProposalsInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const userProposals = useUserProposals()
    const pagination = usePagination(userProposals.totalCount)
    const [filters, setFilters] = useProposalsFilters('my')

    const changeFilters = (localFilters: Filters) => {
        pagination.submit(1)
        setFilters(localFilters)
    }

    const fetch = async () => {
        if (!wallet.address) {
            return
        }

        try {
            await userProposals.fetch(wallet.address, {
                startTimeGe: filters.startTimeGe,
                startTimeLe: filters.startTimeLe,
                endTimeGe: filters.endTimeGe,
                endTimeLe: filters.endTimeLe,
                state: filters.state,
                offset: pagination.offset,
                limit: pagination.limit,
                ordering: {
                    column: 'createdAt',
                    direction: 'DESC',
                },
            })
        }
        catch (e) {
            error(e)
        }
    }

    React.useEffect(() => {
        if (wallet.address) {
            fetch()
        }
        else {
            userProposals.dispose()
        }
    }, [
        filters.state,
        filters.endTimeGe,
        filters.endTimeLe,
        filters.startTimeGe,
        filters.startTimeLe,
        wallet.address,
        pagination.page,
        pagination.limit,
    ])

    return (
        <Section>
            <Header>
                <Title>
                    {intl.formatMessage({
                        id: 'PROPOSALS_USER_TITLE',
                    })}
                </Title>

                <Actions>
                    <UnlockAllButton onSuccess={fetch} />

                    <ProposalsFilters
                        filters={filters}
                        onChangeFilters={changeFilters}
                    />
                </Actions>
            </Header>

            <WalletMiddleware>
                <div className="card card--flat card--xsmall">
                    <Table
                        className="proposals-user-table"
                        loading={userProposals.loading}
                        cols={[{
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_NO',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_SUMMARY',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_MY_VOTE',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_STATUS',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_VOTING',
                            }),
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_DATE',
                            }),
                            align: 'right',
                        }, {
                            name: intl.formatMessage({
                                id: 'PROPOSALS_TABLE_UNLOCK',
                            }),
                            align: 'right',
                        }]}
                        rows={userProposals.items.map(({ proposal, vote }) => ({
                            cells: [
                                proposal.proposalId || '–',
                                proposal.state ? (
                                    <ProposalSummary
                                        state={proposal.state}
                                        id={proposal.proposalId}
                                        description={proposal.description}
                                    />
                                ) : '–',
                                vote?.support !== undefined ? (
                                    <VoteType
                                        badge
                                        type={vote.support ? 1 : 0}
                                        value={vote.votes
                                            ? formattedAmount(vote.votes, wallet.coin.decimals)
                                            : undefined}
                                    />
                                ) : '–',
                                proposal.state ? <ProposalStatus state={proposal.state} /> : '–',
                                <ProposalProgress
                                    againstVotes={proposal.againstVotes}
                                    forVotes={proposal.forVotes}
                                />,
                                proposal.startTime && proposal.endTime ? (
                                    <DateCard
                                        startTime={proposal.startTime * 1000}
                                        endTime={proposal.endTime * 1000}
                                    />
                                ) : '–',
                                proposal.proposalId && proposal.state ? (
                                    <UnlockButton
                                        showSuccessIcon
                                        proposalId={proposal.proposalId}
                                        state={proposal.state}
                                    />
                                ) : '–',
                            ],
                        }))}
                    />

                    <Pagination
                        totalPages={pagination.totalPages}
                        currentPage={pagination.page}
                        onNext={pagination.next}
                        onPrev={pagination.prev}
                    />
                </div>
            </WalletMiddleware>

        </Section>
    )
}

export const UserProposals = observer(UserProposalsInner)

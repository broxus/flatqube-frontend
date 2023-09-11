import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Header, Section, Title } from '@/modules/Governance/components/Section'
import { Table } from '@/modules/Governance/components/Table'
import { UserCard } from '@/modules/Governance/components/UserCard'
import { VoteType } from '@/modules/Governance/components/VoteType'
import { VoteReason } from '@/modules/Governance/components/VoteReason'
import { useProposalContext } from '@/modules/Governance/providers'
import { formatDate, error, formattedAmount } from '@/utils'
import { usePagination } from '@/modules/Governance/hooks'
import { useWallet } from '@/stores/WalletService'
import { Pagination } from '@/components/common/Pagination'

import './index.scss'

export function VotesTableInner(): JSX.Element {
    const intl = useIntl()
    const proposal = useProposalContext()
    const pagination = usePagination(proposal.allVotes.totalCount)
    const wallet = useWallet()

    const fetch = async () => {
        try {
            await proposal.allVotes.fetch({
                proposalId: proposal.id,
                limit: pagination.limit,
                offset: pagination.offset,
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
        if (proposal.id) {
            fetch()
        }
        else {
            proposal.allVotes.dispose()
        }
    }, [
        proposal.id,
        pagination.page,
        pagination.limit,
    ])

    return (
        <Section id="votes">
            <Header>
                <Title>
                    {intl.formatMessage({
                        id: 'VOTES_TABLE_TITLE',
                    })}
                </Title>
            </Header>

            <div className="card card--flat card--xsmall">
                <Table
                    loading={proposal.allVotes.loading}
                    className="votes-table"
                    cols={[{
                        name: intl.formatMessage({
                            id: 'VOTES_TABLE_VOTER',
                        }),
                    }, {
                        name: intl.formatMessage({
                            id: 'VOTES_TABLE_REASON',
                        }),
                    }, {
                        name: intl.formatMessage({
                            id: 'VOTES_TABLE_VOTING',
                        }),
                        align: 'right',
                    }, {
                        name: intl.formatMessage({
                            id: 'VOTES_TABLE_DATE',
                        }),
                        align: 'right',
                    }]}
                    rows={proposal.allVotes.items.map(item => ({
                        cells: [
                            <UserCard address={item.voter} />,
                            item.reason ? <VoteReason value={item.reason} /> : '–',
                            <VoteType
                                badge
                                type={item.support ? 1 : 0}
                                value={item.votes
                                    ? formattedAmount(item.votes, wallet.coin.decimals)
                                    : undefined}
                            />,
                            formatDate(item.createdAt * 1000),
                        ],
                    }))}
                />

                <Pagination
                    totalPages={pagination.totalPages}
                    currentPage={pagination.page}
                    onNext={pagination.next}
                    onSubmit={pagination.submit}
                    onPrev={pagination.prev}
                />
            </div>
        </Section>
    )
}

export const VotesTable = observer(VotesTableInner)

/* eslint-disable sort-keys */
import * as React from 'react'
import { useIntl } from 'react-intl'

import { ProposalSummary } from '@/modules/Governance/components/ProposalSummary'
import { ProposalStatus } from '@/modules/Governance/components/ProposalStatus'
import { ProposalProgress } from '@/modules/Governance/components/ProposalProgress'
import { DateCard } from '@/modules/Governance/components/DateCard'
import { Proposal } from '@/modules/Governance/types'
import { Table } from '@/modules/Governance/components/Table'

import './index.scss'

type Props = {
    loading?: boolean;
    items: Proposal[];
}

export function ProposalsTable({
    loading,
    items,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <Table
            className="proposals-table"
            loading={loading}
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
            }]}
            rows={items.map(item => ({
                cells: [
                    item.proposalId || '–',
                    item.state ? (
                        <ProposalSummary
                            state={item.state}
                            id={item.proposalId}
                            description={item.description}
                        />
                    ) : '–',
                    item.state ? <ProposalStatus state={item.state} /> : '–',
                    <ProposalProgress
                        againstVotes={item.againstVotes}
                        forVotes={item.forVotes}
                    />,
                    item.endTime && item.startTime ? (
                        <DateCard
                            startTime={item.startTime * 1000}
                            endTime={item.endTime * 1000}
                        />
                    ) : '–',
                ],
            }))}
        />
    )
}

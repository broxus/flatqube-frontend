import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Summary } from '@/modules/Governance/components/Summary'
import { useProposalContext } from '@/modules/Governance/providers'
import { formatDate } from '@/utils'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'

export function ProposalInfoInner(): JSX.Element | null {
    const proposal = useProposalContext()
    const intl = useIntl()

    return (
        <>
            <div className="proposal-content__title">
                {intl.formatMessage({
                    id: 'PROPOSAL_INFO_TITLE',
                })}
            </div>

            <Summary
                compact
                adaptive
                space="sm"
                items={[{
                    key: intl.formatMessage({
                        id: 'PROPOSAL_INFO_ADDRESS',
                    }),
                    value: proposal.proposalAddress ? (
                        <div className="proposal-content__address">
                            <AccountExplorerLink address={proposal.proposalAddress} />
                            <CopyToClipboard text={proposal.proposalAddress} />
                        </div>
                    ) : '–',
                }, {
                    key: intl.formatMessage({
                        id: 'PROPOSAL_INFO_VOTING_START',
                    }),
                    value: proposal.startTime ? formatDate(proposal.startTime) : '–',
                }, {
                    key: intl.formatMessage({
                        id: 'PROPOSAL_INFO_VOTING_END',
                    }),
                    value: proposal.endTime ? formatDate(proposal.endTime) : '–',
                }]}
            />
        </>
    )
}

export const ProposalInfo = observer(ProposalInfoInner)

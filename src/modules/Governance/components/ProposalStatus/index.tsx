import * as React from 'react'
import { useIntl } from 'react-intl'

import { ProposalState } from '@/modules/Governance/types'
import { Badge, Props as BadgeProps } from '@/components/common/Badge'

type Props = {
    state: ProposalState;
}

const intlIdMap = new Map<ProposalState, string>([
    ['Pending', 'PROPOSALS_STATE_PENDING'],
    ['Active', 'PROPOSALS_STATE_ACTIVE'],
    ['Canceled', 'PROPOSALS_STATE_CANCELED'],
    ['Failed', 'PROPOSALS_STATE_FAILED'],
    ['Succeeded', 'PROPOSALS_STATE_SUCCEEDED'],
    ['Expired', 'PROPOSALS_STATE_EXPIRED'],
    ['Queued', 'PROPOSALS_STATE_QUEUED'],
    ['Executed', 'PROPOSALS_STATE_EXECUTED'],
])

const statusMap = new Map<ProposalState, BadgeProps['type']>([
    ['Pending', 'default'],
    ['Active', 'default'],
    ['Canceled', 'disabled'],
    ['Failed', 'red'],
    ['Succeeded', 'green'],
    ['Expired', 'red'],
    ['Queued', 'yellow'],
    ['Executed', 'green'],
])

export function ProposalStatus({
    state,
}: Props): JSX.Element {
    const intl = useIntl()
    const id = intlIdMap.get(state) || 'PROPOSALS_STATE_UNKNOWN'
    const status = statusMap.get(state) || 'red'

    return (
        <Badge type={status}>
            {intl.formatMessage({ id })}
        </Badge>
    )
}

/* eslint-disable no-nested-ternary */
import * as React from 'react'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Summary } from '@/modules/Governance/components/Summary'
import { ProposalType, TonAction } from '@/modules/Governance/types'
import { formattedAmount } from '@/utils'
import { useWallet } from '@/stores/WalletService'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'
import { TonActionData as TonActionDataType } from '@/modules/Governance/stores'
import { CandidateItem } from '@/modules/Governance/components/CandidateItem'

import './index.scss'

type Props = {
    action: TonAction,
    data?: TonActionDataType,
}

export function TonActionData({
    action,
    data,
}: Props): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

    return (
        <Summary
            compact
            adaptive
            space="sm"
            items={[
                ...data !== undefined ? [{
                    key: intl.formatMessage({
                        id: 'PROPOSAL_ACTION_TYPE',
                    }),
                    value: (
                        <div className="action-data">
                            {data.type === ProposalType.NewCandidate ? intl.formatMessage({
                                id: 'PROPOSAL_FORM_NEW_CANDIDATE',
                            }) : data.type === ProposalType.RemoveCandidate ? intl.formatMessage({
                                id: 'PROPOSAL_FORM_REMOVE_CANDIDATE',
                            }) : intl.formatMessage({
                                id: 'PROPOSAL_FORM_CUSTOM_ACTION',
                            })}
                        </div>
                    ),
                }] : [],
                ...((
                    data?.type === ProposalType.NewCandidate
                    || data?.type === ProposalType.RemoveCandidate
                ) && data.gaugeData) ? [{
                        key: intl.formatMessage({
                            id: 'PROPOSAL_ACTION_GAUGE',
                        }),
                        value: (
                            <div className="action-data">
                                <CandidateItem
                                    copy
                                    asLink
                                    address={data.gaugeData.address}
                                    tokensInfo={data.gaugeData.poolTokens}
                                />
                            </div>
                        ),
                    }] : [],
                {
                    key: intl.formatMessage({
                        id: 'PROPOSAL_ACTION_PAYLOAD',
                    }),
                    value: (
                        <div className="action-data">
                            {action.payload}
                        </div>
                    ),
                }, {
                    key: intl.formatMessage({
                        id: 'PROPOSAL_ACTION_TARGET',
                    }),
                    value: (
                        <div className="action-data__address">
                            <AccountExplorerLink address={action.target} />
                            <CopyToClipboard text={action.target} />
                        </div>
                    ),
                }, {
                    key: intl.formatMessage({
                        id: 'PROPOSAL_ACTION_VALUE',
                    }),
                    value: (
                        <div className="action-data">
                            {formattedAmount(action.value, wallet.coin.decimals)}
                        </div>
                    ),
                },
            ]}
        />
    )
}

import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { formattedAmount } from '@/utils'
import { useProposalCreateContext } from '@/modules/Governance/providers'
import { DaoConfigStore } from '@/modules/Governance/stores'
import { appRoutes } from '@/routes'

import './index.scss'

export function ProposalFormWarningInner(): JSX.Element | null {
    const intl = useIntl()
    const proposalCreate = useProposalCreateContext()

    if (!proposalCreate.tokenMissing && !proposalCreate.threshold) {
        return null
    }

    return (
        <div className="card card--flat card--xsmall">
            <div className="proposal-form-warning">
                <h2 className="proposal-form-warning__title">
                    {intl.formatMessage({
                        id: 'PROPOSAL_FORM_WARNING_TITLE',
                    })}
                </h2>

                <div className="proposal-form-warning__text text-muted">
                    {proposalCreate.hasLockedTokens && proposalCreate.lockedTokens ? (
                        intl.formatMessage({
                            id: 'PROPOSAL_FORM_LOCKED_TEXT',
                        }, {
                            locked: formattedAmount(
                                proposalCreate.lockedTokens,
                                DaoConfigStore.tokenDecimals,
                            ),
                            amount: formattedAmount(
                                proposalCreate.tokenMissing || proposalCreate.threshold,
                                DaoConfigStore.tokenDecimals,
                            ),
                        })
                    ) : (
                        intl.formatMessage({
                            id: 'PROPOSAL_FORM_WARNING_TEXT',
                        }, {
                            amount: formattedAmount(
                                proposalCreate.tokenMissing || proposalCreate.threshold,
                                DaoConfigStore.tokenDecimals,
                            ),
                        })
                    )}
                </div>

                <Button
                    type="primary"
                    size="md"
                    link={appRoutes.daoBalance.makeUrl()}
                >
                    {intl.formatMessage({
                        id: 'PROPOSAL_FORM_LINK',
                    })}
                </Button>
            </div>
        </div>
    )
}

export const ProposalFormWarning = observer(ProposalFormWarningInner)

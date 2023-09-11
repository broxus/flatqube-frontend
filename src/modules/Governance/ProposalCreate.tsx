/* eslint-disable sort-keys */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer, observer } from 'mobx-react-lite'

import { ContentLoader } from '@/components/common/ContentLoader'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Container, Title } from '@/modules/Governance/components/Section'
import { ProposalForm } from '@/modules/Governance/components/ProposalForm'
import { ProposalFormWarning } from '@/modules/Governance/components/ProposalFormWarning'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { useProposalCreateContext } from '@/modules/Governance/providers'
import { useWallet } from '@/stores/WalletService'
import { useDebounce } from '@/hooks'
import { appRoutes } from '@/routes'

import './index.scss'

export function ProposalCreateInner(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const proposalCreate = useProposalCreateContext()
    const isInitializing = useDebounce(wallet.isInitializing, 100)

    if (isInitializing) {
        return null
    }

    return (
        <Container size="lg">
            <Breadcrumb
                items={[{
                    title: intl.formatMessage({
                        id: 'GOVERNANCE_BREADCRUMB_OVERVIEW',
                    }),
                    link: appRoutes.dao.makeUrl(),
                }, {
                    title: intl.formatMessage({
                        id: 'GOVERNANCE_BREADCRUMB_PROPOSALS',
                    }),
                    link: appRoutes.daoProposals.makeUrl(),
                }, {
                    title: intl.formatMessage({
                        id: 'GOVERNANCE_BREADCRUMB_CREATE',
                    }),
                }]}
            />

            <Title size="lg">
                {intl.formatMessage({
                    id: 'PROPOSAL_FORM_TITLE',
                })}
            </Title>

            <WalletMiddleware>
                <Observer>
                    {() => (
                        /* eslint-disable no-nested-ternary */
                        proposalCreate.canCreate === undefined ? (
                            <div className="card card--flat card--xsmall">
                                <ContentLoader />
                            </div>
                        ) : (
                            proposalCreate.canCreate === true ? (
                                <ProposalForm />
                            ) : (
                                <ProposalFormWarning />
                            )
                        )
                    )}
                </Observer>
            </WalletMiddleware>
        </Container>
    )
}

export const ProposalCreate = observer(ProposalCreateInner)

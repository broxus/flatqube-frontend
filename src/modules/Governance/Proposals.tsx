/* eslint-disable sort-keys */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Container, Header, Title } from '@/modules/Governance/components/Section'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProposalsList } from '@/modules/Governance/components/ProposalsList'
import { UserStats } from '@/modules/Governance/components/UserStats'
import { UserProposals } from '@/modules/Governance/components/UserProposals'
import { useWallet } from '@/stores/WalletService'
import { appRoutes } from '@/routes'

import './index.scss'

export function Proposals(): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

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
                }]}
            />

            <Header size="lg">
                <Title size="lg">
                    {intl.formatMessage({
                        id: 'PROPOSALS_TITLE',
                    })}
                </Title>

                <Button
                    size="md"
                    type="primary"
                    link={appRoutes.daoProposalsCreate.makeUrl()}
                >
                    {intl.formatMessage({
                        id: 'PROPOSALS_CREATE',
                    })}
                </Button>
            </Header>

            <Observer>
                {() => (
                    wallet.isConnected
                        ? <UserStats />
                        : null
                )}
            </Observer>

            <Observer>
                {() => (
                    wallet.isConnected
                        ? <UserProposals />
                        : null
                )}
            </Observer>

            <ProposalsList />
        </Container>
    )
}

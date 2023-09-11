/* eslint-disable sort-keys */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import { ProposalsTable } from '@/modules/Governance/components/ProposalsTable'
import { useProposals } from '@/modules/Governance/hooks'
import { error } from '@/utils'
import { Icon } from '@/components/common/Icon'
import { Section, Title, Header } from '@/modules/Governance/components/Section'
import { appRoutes } from '@/routes'

export function RecentProposals(): JSX.Element {
    const intl = useIntl()
    const proposals = useProposals()

    const fetch = async () => {
        try {
            await proposals.fetch({
                offset: 0,
                limit: 3,
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
        fetch()
    }, [])

    return (
        <Section>
            <Header>
                <Title>
                    {intl.formatMessage({
                        id: 'GOVERNANCE_RECENT_PROPOSALS',
                    })}
                </Title>

                <Link
                    className="btn-with-icon text-bold"
                    to={appRoutes.daoProposals.makeUrl()}
                >
                    {intl.formatMessage({
                        id: 'PROPOSALS_VIEW_ALL',
                    })}
                    <Icon icon="chevronRight" ratio={0.8} />
                </Link>
            </Header>

            <div className="card card--flat card--xsmall">
                <Observer>
                    {() => (
                        <ProposalsTable
                            loading={proposals.loading}
                            items={proposals.items}
                        />
                    )}
                </Observer>
            </div>
        </Section>
    )
}

import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'

import { Header, Section, Title } from '@/modules/Governance/components/Section'
import { DataCard } from '@/modules/Governance/components/DataCard'
import { useVotingContext } from '@/modules/Governance/providers'
import { formattedAmount } from '@/utils'
import { DaoConfigStore } from '@/modules/Governance/stores'

export function UserStats(): JSX.Element {
    const intl = useIntl()
    const voting = useVotingContext()

    return (
        <Section>
            <Header>
                <Title>
                    {intl.formatMessage({
                        id: 'USER_VOTES_TITLE',
                    })}
                </Title>
            </Header>

            <Observer>
                {() => (
                    <div className="tiles tiles_twice">
                        <DataCard
                            title={intl.formatMessage({
                                id: 'USER_VOTES_WEIGHT',
                            })}
                            value={voting.tokenBalance && DaoConfigStore.tokenDecimals
                                ? formattedAmount(voting.tokenBalance, DaoConfigStore.tokenDecimals)
                                : '–'}
                        />
                        <DataCard
                            title={intl.formatMessage({
                                id: 'USER_VOTES_VOTED',
                            })}
                            value={voting.votesCount || '–'}
                        />
                    </div>
                )}
            </Observer>
        </Section>
    )
}

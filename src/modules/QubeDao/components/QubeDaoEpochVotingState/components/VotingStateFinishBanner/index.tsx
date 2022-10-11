import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

export function VotingStateFinishBanner(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateStore()

    return (
        <Observer>
            {() => (
                <section className="section">
                    <div className="card card--flat card--ghost text-center">
                        <h3 className="text-heading">
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FINISH_TITLE' })}
                        </h3>
                        <p className="margin-bottom">
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FINISH_NOTE' })}
                        </p>
                        <Button
                            className="btn-with-icon"
                            disabled={daoContext.isVotingFinishing}
                            type="primary"
                            onClick={votesStore.endVoting}
                        >
                            {daoContext.isVotingFinishing && (
                                <Icon className="spin" icon="loader" ratio={0.75} />
                            )}
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FINISH_BTN_TEXT' })}
                        </Button>
                    </div>
                </section>
            )}
        </Observer>
    )
}

import { Observer } from 'mobx-react-lite'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { VoteConfirmationPopup } from '@/modules/QubeDao/components/QubeDaoUserVotes/components/VoteConfirmationPopup'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { isGoodBignumber, uniqueId } from '@/utils'
import { Icon } from '@/components/common/Icon'

import styles from './index.module.scss'

export function CandidatesFormListActions(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateStore()

    const [isAwaitingConfirmation, setAwaitingConfirmation] = React.useState(false)

    const add = React.useCallback(() => {
        const selectedGauges = votesStore.candidates.slice()
        selectedGauges.push({
            address: '',
            amount: '',
            key: uniqueId(),
        })
        votesStore.setData('candidates', selectedGauges)
    }, [])

    const confirm = React.useCallback(() => {
        setAwaitingConfirmation(true)
    }, [])

    const dismissConfirmation = React.useCallback(() => {
        setAwaitingConfirmation(false)
    }, [])

    return (
        <>
            <Observer>
                {() => {
                    const disabled = daoContext.isVotingEpoch || !isGoodBignumber(daoContext.userVeBalance ?? 0)
                    return (
                        <div className={styles.footer}>
                            <Button
                                disabled={disabled || votesStore.isLimitExceed}
                                type="link"
                                onClick={!votesStore.isLimitExceed ? add : undefined}
                            >
                                {intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_ADD_CANDIDATE_BTN_TEXT' })}
                            </Button>
                            <Button
                                disabled={disabled || !votesStore.isValid}
                                size="md"
                                style={{ width: 200 }}
                                type="primary"
                                onClick={confirm}
                            >
                                {daoContext.isVotingEpoch ? (
                                    <Icon className="spin" icon="loader" ratio={0.75} />
                                ) : intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_VOTE_BTN_TEXT' })}
                            </Button>
                        </div>
                    )
                }}
            </Observer>

            {isAwaitingConfirmation && (
                <VoteConfirmationPopup onDismiss={dismissConfirmation} />
            )}
        </>
    )
}

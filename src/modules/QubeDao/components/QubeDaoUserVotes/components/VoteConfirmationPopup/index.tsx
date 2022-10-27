import * as ReactDOM from 'react-dom'
import * as React from 'react'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useQubeDaoVotingStateContext } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

type Props = {
    onDismiss: () => void;
}

export function VoteConfirmationPopup({ onDismiss }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const votesStore = useQubeDaoVotingStateContext()

    const [isAwaiting, setAwaiting] = React.useState(false)

    const onConfirm = React.useCallback(async () => {
        setAwaiting(true)
        try {
            await votesStore.voteEpoch({
                onSend: () => {
                    onDismiss()
                },
                onTransactionFailure: () => {
                    setAwaiting(false)
                },
            })
        }
        catch (e) {
            setAwaiting(false)
        }
    }, [])

    return ReactDOM.createPortal(
        <div className="popup">
            <div onClick={onDismiss} className="popup-overlay" />
            <div className="popup__wrap popup__wrap-confirm-swap">
                <Button
                    type="icon"
                    onClick={onDismiss}
                    className="popup-close"
                >
                    <Icon icon="close" />
                </Button>
                <h2 className="popup-title">
                    {intl.formatMessage({
                        id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_TITLE',
                    })}
                </h2>

                <p className="margin-vertical">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_NOTE' },
                        { veSymbol: daoContext.veSymbol },
                    )}
                </p>

                <hr className="divider" />

                <div className={styles.bill}>
                    <div className={styles.bill__item}>
                        <div className="text-muted">
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_BILL_VOTE_BALANCE_TERM' })}
                        </div>
                        <div>
                            {`${formattedTokenAmount(daoContext.userVeBalance, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                        </div>
                    </div>
                    <div className={styles.bill__item}>
                        <div className="text-muted">
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_BILL_NOTE_VOTED_BALANCE_TERM' })}
                        </div>
                        <div>
                            {`${formattedTokenAmount(
                                new BigNumber(daoContext.userVeBalance || 0)
                                    .minus(votesStore.scoredUserCandidatesAmount || 0)
                                    .toFixed(),
                                daoContext.veDecimals,
                            )} ${daoContext.veSymbol}`}
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                <div className={styles.bill}>
                    <div className={styles.bill__item}>
                        <div className="text-lg text-bold">
                            {intl.formatMessage({ id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_BILL_VOTE_BALANCE_TERM' })}
                        </div>
                        <div className="text-lg text-bold">
                            {`${formattedTokenAmount(votesStore.scoredUserCandidatesAmount, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                        </div>
                    </div>
                </div>

                <Button
                    block
                    className="margin-top"
                    disabled={isAwaiting}
                    size="lg"
                    type="primary"
                    onClick={isAwaiting ? undefined : onConfirm}
                >
                    {isAwaiting ? (
                        <Icon className="spin" icon="loader" ratio={0.85} />
                    ) : intl.formatMessage({
                        id: 'QUBE_DAO_VOTE_POPUP_CONFORMATION_SUBMIT_BTN_TEXT',
                    })}
                </Button>
            </div>
        </div>,
        document.body,
    )
}

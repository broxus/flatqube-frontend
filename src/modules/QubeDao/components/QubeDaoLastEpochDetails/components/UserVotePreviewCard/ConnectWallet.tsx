import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

import styles from './index.module.scss'

export function ConnectWallet(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className={classNames('card card--xsmall card--flat', styles.user_vote_preview_card)}>
            <div>
                <div className={styles.user_vote_preview_card__supheader}>
                    {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_SUPHEADER' })}
                </div>
                <div className={styles.user_vote_preview_card__lead}>
                    {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_NOT_CONNECTED_LEAD' })}
                </div>
                {!daoContext.wallet.isReady && (
                    <div className={styles.user_vote_preview_card__note}>
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_NOT_CONNECTED_NOTE' },
                            { veSymbol: daoContext.veSymbol },
                        )}
                    </div>
                )}
            </div>
            {!daoContext.wallet.isReady && (
                <Button
                    size="md"
                    type="secondary"
                    onClick={daoContext.wallet.connect}
                >
                    {intl.formatMessage({ id: 'QUBE_DAO_VOTE_PREVIEW_CARD_CONNECT_WALLET_BTN_TEXT' })}
                </Button>
            )}
        </div>
    )
}

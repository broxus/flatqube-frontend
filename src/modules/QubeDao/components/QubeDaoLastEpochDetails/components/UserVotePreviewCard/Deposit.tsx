import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'


export function Deposit(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className={classNames('card card--flat card--xsmall', styles.user_vote_preview_card)}>
            <div>
                <div className={styles.user_vote_preview_card__lead}>
                    {intl.formatMessage({
                        id: 'QUBE_DAO_VOTE_PREVIEW_CARD_DEPOSIT_LEAD',
                    }, { symbol: daoContext.tokenSymbol, veSymbol: daoContext.veSymbol })}
                </div>
                <div className={styles.user_vote_preview_card__note}>
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_DEPOSIT_NOTE' },
                        { veSymbol: daoContext.veSymbol },
                    )}
                </div>
            </div>
            <Button
                link={appRoutes.daoBalance.makeUrl()}
                size="md"
                type="secondary"
            >
                {intl.formatMessage(
                    { id: 'QUBE_DAO_VOTE_PREVIEW_CARD_DEPOSIT_BALANCE_LINK_TEXT' },
                    { symbol: daoContext.tokenSymbol },
                )}
            </Button>
        </div>
    )
}

import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

export function DepositBanner(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    return (
        <div className={classNames('card card--flat card--small', styles.deposit_banner)}>
            <div className={classNames('message message_system', styles.message)}>
                <div className="margin-bottom text-center">
                    <h2 className="text-heading">
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_VOTE_DEPOSIT_BANNER_TITLE' },
                            { symbol: daoContext.tokenSymbol, veSymbol: daoContext.veSymbol },
                        )}
                    </h2>
                    <p>
                        {intl.formatMessage(
                            { id: 'QUBE_DAO_VOTE_DEPOSIT_BANNER_MOTE' },
                            { veSymbol: daoContext.veSymbol },
                        )}
                    </p>
                </div>

                <Button
                    link={appRoutes.daoBalance.makeUrl()}
                    size="md"
                    type="primary"
                >
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_VOTE_DEPOSIT_BANNER_BALANCE_LINK_TEXT' },
                        { symbol: daoContext.tokenSymbol },
                    )}
                </Button>
            </div>
        </div>
    )
}

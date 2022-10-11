import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useNotifiedWithdrawCallbacks } from '@/modules/QubeDao/hooks/useNotifiedWithdrawCallbacks'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

export function QubeDaoWithdrawBanner(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const callbacks = useNotifiedWithdrawCallbacks({})

    const onWithdraw = React.useCallback(async () => {
        await daoContext.withdraw({ ...callbacks })
    }, [])

    return (
        <div className={styles.reward_banner__container}>
            <div>
                <h3 className="text-bold text-lg">
                    {intl.formatMessage(
                        { id: 'QUBE_DAO_WITHDRAW_BANNER_TITLE' },
                        {
                            symbol: daoContext.tokenSymbol,
                            value: formattedTokenAmount(
                                daoContext.unlockedAmount,
                                daoContext.tokenDecimals,
                            ),
                        },
                    )}
                </h3>
                <p className="margin-top">{intl.formatMessage({ id: 'QUBE_DAO_WITHDRAW_BANNER_NOTE' })}</p>
            </div>
            <div>
                <Observer>
                    {() => (
                        <Button
                            className="btn-with-icon width-expand"
                            disabled={daoContext.isWithdrawing}
                            size="md"
                            style={{ justifyContent: 'center' }}
                            type="primary"
                            onClick={onWithdraw}
                        >
                            {daoContext.isWithdrawing && (
                                <Icon className="spin" icon="loader" ratio={0.75} />
                            )}
                            {intl.formatMessage(
                                { id: 'QUBE_DAO_WITHDRAW_BANNER_CLAIM_BTN_TEXT' },
                                {
                                    symbol: daoContext.tokenSymbol,
                                    value: formattedTokenAmount(
                                        daoContext.unlockedAmount,
                                        daoContext.tokenDecimals,
                                    ),
                                },
                            )}
                        </Button>
                    )}
                </Observer>
            </div>
        </div>
    )
}

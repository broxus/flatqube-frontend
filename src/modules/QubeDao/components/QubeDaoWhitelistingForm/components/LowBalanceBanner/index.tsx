import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { QUBERootAddress, WEVERRootAddress } from '@/config'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { useQubeDaoWhitelistingFormContext } from '@/modules/QubeDao/providers/QubeDaoWhitelistingFormStoreProvider'
import { formattedTokenAmount } from '@/utils'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

export function LowBalanceBanner(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const whitelistingStore = useQubeDaoWhitelistingFormContext()

    return (
        <div className={classNames('card card--flat card--xsmall', styles.low_balance_banner)}>
            <div className="text-bold text-lg">
                {intl.formatMessage(
                    { id: 'QUBE_DAO_WHITELIST_FORM_LOW_BALANCE_BANNER_NOTE' },
                    {
                        price: formattedTokenAmount(
                            whitelistingStore.price,
                            daoContext.tokenDecimals,
                            { preserve: true },
                        ),
                        symbol: daoContext.tokenSymbol,
                    },
                )}
            </div>
            <Button
                className="margin-top"
                link={appRoutes.swap.makeUrl({
                    leftTokenRoot: WEVERRootAddress.toString(),
                    rightTokenRoot: QUBERootAddress.toString(),
                })}
                type="primary"
            >
                {intl.formatMessage(
                    { id: 'QUBE_DAO_WHITELIST_FORM_LOW_BALANCE_LINK_TXT' },
                    { symbol: daoContext.tokenSymbol },
                )}
            </Button>
        </div>
    )
}

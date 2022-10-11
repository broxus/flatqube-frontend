import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Placeholder } from '@/components/common/Placeholder'
import { TokensSpeedTable } from '@/modules/Gauges/components/GaugesTokensSpeed/Table'

import styles from './index.module.scss'

function GaugesTokensSpeedInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)

    return (
        <div className={styles.tokensSpeed}>
            <GaugesTitle>
                {data.extraTokens ? (
                    data.extraTokens.length > 0 && (
                        <div className={styles.tokens}>
                            {data.extraTokens.map(token => (
                                <TokenIcon
                                    key={token.root}
                                    size="small"
                                    address={token.root}
                                    icon={token.icon}
                                    className={styles.token}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <Placeholder circle width={24} />
                )}

                {intl.formatMessage({
                    id: 'GAUGE_TOKENS_SPEED_TITLE',
                })}
            </GaugesTitle>

            <TokensSpeedTable />
        </div>
    )
}

export const GaugesTokensSpeed = observer(GaugesTokensSpeedInner)

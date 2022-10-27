import * as React from 'react'
import { Link } from 'react-router-dom'

import type { TokenIconProps } from '@/components/common/TokenIcon'
import { TokenIcons } from '@/components/common/TokenIcons'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { GaugeItem } from '@/modules/QubeDao/types'
import { sliceAddress } from '@/utils'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

type Props = {
    address: string;
    gaugeDetails?: GaugeItem['poolTokens'];
    linkable?: boolean;
    size?: TokenIconProps['size'];
}

function QubeDaoCandidateItemInternal({ address, gaugeDetails, linkable = true, size }: Props): JSX.Element {
    const daoContext = useQubeDaoContext()

    const tokens = React.useMemo(() => gaugeDetails?.map(details => {
        const token = daoContext.tokensCache.get(details.tokenRoot)
        return {
            address: details.tokenRoot,
            icon: token?.icon,
            symbol: token?.symbol ?? details.tokenSymbol,
        }
    }), [gaugeDetails])

    return (
        <div className={styles.gauge_candidate_item}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {gaugeDetails ? (
                <>
                    <TokenIcons icons={tokens ?? []} size={size} />
                    {linkable ? (
                        <Link to={appRoutes.gaugesItem.makeUrl({ address })}>
                            {tokens?.map(token => token.symbol).join('/')}
                        </Link>
                    ) : (
                        <span className={styles.gauge_candidate_item__label}>
                            {tokens?.map(token => token.symbol).join('/')}
                        </span>
                    )}
                </>
            ) : linkable ? (
                <Link to={appRoutes.gaugesItem.makeUrl({ address })}>
                    {sliceAddress(address)}
                </Link>
            ) : (
                <span className={styles.gauge_candidate_item__label}>
                    {sliceAddress(address)}
                </span>
            )}
        </div>
    )
}

export const QubeDaoCandidateItem = React.memo(QubeDaoCandidateItemInternal)

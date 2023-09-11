import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Link } from 'react-router-dom'

import { sliceAddress } from '@/utils'
import { useTokensCache } from '@/stores/TokensCacheService'
import { TokenIcons } from '@/components/common/TokenIcons'
import { GaugeItemPoolTokenInfo } from '@/modules/QubeDao/types'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'
import { appRoutes } from '@/routes'

import './index.scss'

type Props = {
    address: string,
    tokensInfo: GaugeItemPoolTokenInfo[],
    asLink?: boolean,
    copy?: boolean,
}

function CandidateItemInner({
    address,
    tokensInfo,
    asLink,
    copy,
}: Props): JSX.Element | null {
    const tokensCache = useTokensCache()

    const tokens = React.useMemo(() => tokensInfo.map(info => {
        const token = tokensCache.get(info.tokenRoot)

        return {
            address: info.tokenRoot,
            icon: token?.icon,
            symbol: token?.symbol ?? info.tokenSymbol,
        }
    }), [tokensInfo])

    const icons = <TokenIcons icons={tokens ?? []} size="xsmall" />
    const symbol = tokens?.map(token => token.symbol).join('/')

    return (
        <div className="proposal-candidate-item">
            {asLink ? (
                <Link to={appRoutes.gaugesItem.makeUrl({ address })}>
                    {icons}
                </Link>
            ) : (
                icons
            )}
            {asLink ? (
                <Link to={appRoutes.gaugesItem.makeUrl({ address })}>
                    {symbol}
                </Link>
            ) : (
                symbol
            )}
            {asLink ? (
                <Link to={appRoutes.gaugesItem.makeUrl({ address })}>
                    {sliceAddress(address)}
                </Link>
            ) : (
                sliceAddress(address)
            )}
            {copy && (
                <CopyToClipboard text={address} />
            )}
        </div>
    )
}

export const CandidateItem = observer(CandidateItemInner)

import * as React from 'react'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { PoolTransactions } from '@/modules/Pools/components/PoolTransactions'
import { PoolFarmings } from '@/modules/Pools/components/PoolContent/farmings'
import { PoolBreadcrumb } from '@/modules/Pools/components/PoolContent/Breadcrumb'
import { usePoolContent } from '@/modules/Pools/hooks/usePoolContent'
import { PoolTitle } from '@/modules/Pools/components/PoolContent/Title'
import { PoolToolbar } from '@/modules/Pools/components/PoolContent/Toolbar'
import { TotalBalance } from '@/modules/Pools/components/PoolContent/TotalBalance'
import { WalletBalance } from '@/modules/Pools/components/PoolContent/WalletBalance'
import { LockedBalance } from '@/modules/Pools/components/PoolContent/LockedBalance'
import { NotFoundError } from '@/components/common/Error'

export function PoolContent(): JSX.Element {
    const intl = useIntl()
    const poolContent = usePoolContent()

    if (poolContent.notFounded) {
        return (
            <NotFoundError />
        )
    }

    return (
        <>
            <PoolBreadcrumb poolContent={poolContent} />
            <PoolTitle poolContent={poolContent} />
            <PoolToolbar poolContent={poolContent} />

            <div className="pools-sub-header">
                <SectionTitle size="small">
                    {intl.formatMessage({
                        id: 'POOLS_LIST_USER_BALANCE',
                    })}
                </SectionTitle>
            </div>

            <div className="pools-balances">
                <TotalBalance poolContent={poolContent} />
                <WalletBalance poolContent={poolContent} />
                <LockedBalance poolContent={poolContent} />
            </div>

            <div className="pools-sub-header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'POOLS_FARMINGS_TITLE' })}
                </SectionTitle>
            </div>

            <PoolFarmings poolContent={poolContent} />

            {poolContent.pairAddress && poolContent.ownerAddress && (
                <PoolTransactions
                    poolAddress={poolContent.pairAddress.toString()}
                    userAddress={poolContent.ownerAddress.toString()}
                />
            )}
        </>
    )
}

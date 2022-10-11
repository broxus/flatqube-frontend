import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { reaction } from 'mobx'

import { PanelLoader } from '@/components/common/PanelLoader'
import { SectionTitle } from '@/components/common/SectionTitle'
import { DepositsListEmpty } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/DepositsListEmpty'
import { DepositsListHeader } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/DepositsListHeader'
import { DepositListItem } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/DepositListItem'
import { DepositsListPagination } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/DepositsListPagination'
import { DepositsListPlaceholder } from '@/modules/QubeDao/components/QubeDaoUserDeposits/components/DepositsListPlaceholder'
import { useQubeDaoDepositsStore } from '@/modules/QubeDao/providers/QubeDaoDepositsStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'

import styles from './index.module.scss'

export function QubeDaoUserDeposits(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const depositsStore = useQubeDaoDepositsStore()

    React.useEffect(() => reaction(
        () => [daoContext.wallet.isReady, daoContext.tokensCache.isReady],
        async ([isWalletReady, isTokensCacheReady]) => {
            if (isWalletReady && isTokensCacheReady) {
                await depositsStore.fetch(true)
            }
        },
        { delay: 50, fireImmediately: true },
    ))

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_BALANCE_USER_DEPOSITS_TITLE' })}
                </SectionTitle>
            </header>

            <Observer>
                {() => (
                    <div className="card card--flat card--xsmall">
                        <div className={classNames('list', styles.deposits_list, styles.list)}>
                            {depositsStore.deposits.length > 0 && (
                                <DepositsListHeader />
                            )}

                            {(() => {
                                const isFetching = depositsStore.isFetching || depositsStore.isFetching === undefined

                                switch (true) {
                                    case isFetching && depositsStore.deposits.length === 0:
                                        return <DepositsListPlaceholder />

                                    case depositsStore.deposits.length > 0:
                                        return (
                                            <PanelLoader loading={isFetching}>
                                                {depositsStore.deposits.map(deposit => (
                                                    <DepositListItem key={deposit.transactionHash} deposit={deposit} />
                                                ))}
                                            </PanelLoader>
                                        )

                                    default:
                                        return <DepositsListEmpty />
                                }
                            })()}
                        </div>

                        {depositsStore.pagination && depositsStore.pagination.totalPages > 1 && (
                            <DepositsListPagination />
                        )}
                    </div>
                )}
            </Observer>
        </section>
    )
}

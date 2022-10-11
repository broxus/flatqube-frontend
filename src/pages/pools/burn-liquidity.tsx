import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { BurnLiquidity } from '@/modules/Pools/burn-liquidity'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { useWallet } from '@/stores/WalletService'

export default function Page(): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

    return (
        <Observer>
            {() => (
                <div
                    className={classNames('container', {
                        'container--large': !wallet.isReady,
                        'container--small': wallet.isReady,
                    })}
                >
                    <section className="section">
                        {!wallet.isReady && (
                            <div className="section__header section__header_wrap">
                                <SectionTitle>
                                    {intl.formatMessage({ id: 'REMOVE_LIQUIDITY_FORM_TITLE' })}
                                </SectionTitle>
                            </div>
                        )}
                        <WalletMiddleware>
                            <BurnLiquidity />
                        </WalletMiddleware>
                    </section>
                </div>
            )}
        </Observer>
    )
}

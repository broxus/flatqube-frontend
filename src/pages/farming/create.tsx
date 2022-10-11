import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { Create } from '@/modules/Farming/create'
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
                                    {intl.formatMessage({ id: 'FARMING_CREATE_HEADER_TITLE' })}
                                </SectionTitle>
                            </div>
                        )}
                        <WalletMiddleware>
                            <Create />
                        </WalletMiddleware>
                    </section>
                </div>
            )}
        </Observer>
    )
}

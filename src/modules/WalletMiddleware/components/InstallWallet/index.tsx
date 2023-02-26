import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'

export function InstallWallet(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="card card--small card--flat wallet-install-card">
            <div className="message text-center">
                <div className="margin-bottom">
                    <h2 className="card-title margin-bottom">
                        {intl.formatMessage({ id: 'WALLET_MIDDLEWARE_INSTALLATION_TITLE' })}
                    </h2>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: intl.formatMessage({ id: 'WALLET_MIDDLEWARE_INSTALLATION_NOTE' }),
                        }}
                    />
                </div>

                <Button
                    href="https://chrome.google.com/webstore/detail/ever-wallet/cgeeodpfagjceefieflmdfphplkenlfk"
                    rel="nofollow noopener noreferrer"
                    size="lg"
                    target="_blank"
                    type="primary"
                >
                    {intl.formatMessage({ id: 'WALLET_INSTALLATION_LINK_TEXT' })}
                </Button>
            </div>
        </div>
    )
}

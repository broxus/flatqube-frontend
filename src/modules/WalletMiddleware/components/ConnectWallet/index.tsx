import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { useWallet } from '@/stores/WalletService'

type Props = {
    message?: string;
}

export function ConnectWallet({ message }: Props): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

    return (
        <div className="card card--small card--flat wallet-connect-card">
            <div className="message text-center">
                <div className="margin-bottom">
                    <h2 className="card-title">
                        {intl.formatMessage({ id: 'WALLET_MIDDLEWARE_CONNECTION_TITLE' })}
                    </h2>
                    {message && (
                        <p>{message}</p>
                    )}
                </div>

                <Button
                    size="md"
                    type="primary"
                    onClick={wallet.connect}
                >
                    {intl.formatMessage({ id: 'WALLET_CONNECT_BTN_TEXT' })}
                </Button>

            </div>
        </div>
    )
}

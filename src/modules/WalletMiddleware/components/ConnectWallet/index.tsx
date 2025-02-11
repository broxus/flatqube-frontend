import * as React from 'react'
import { useIntl } from 'react-intl'
import { useTvmWalletService, TvmConnectButton } from '@broxus/tvm-connect/lib'

import { Button } from '@/components/common/Button'

type Props = {
    message?: string;
}

export function ConnectWallet({ message }: Props): JSX.Element {
    const intl = useIntl()
    const walletService = useTvmWalletService()

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

                <TvmConnectButton
                    trigger={({ connect, disabled }) => (
                        <Button
                            aria-disabled={disabled}
                            disabled={disabled}
                            size="md"
                            type="primary"
                            onClick={connect}
                        >
                            {intl.formatMessage({
                                id: 'WALLET_CONNECT_BTN_TEXT',
                            })}
                        </Button>
                    )}
                    standalone={walletService.providers.length === 1}
                />
            </div>
        </div>
    )
}

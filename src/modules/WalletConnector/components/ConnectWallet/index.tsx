import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'

type Props = {
    onClickConnect: () => void;
    message?: string;
}

export function ConnectWallet({
    onClickConnect,
    message,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div className="card card--small card--flat">
            <div className="message message_system">
                {message && (
                    <p>{message}</p>
                )}

                <Button
                    type="secondary"
                    onClick={onClickConnect}
                >
                    {intl.formatMessage({ id: 'EVER_WALLET_CONNECT_BTN_TEXT' })}
                </Button>
            </div>
        </div>
    )
}

/* eslint-disable react/jsx-no-useless-fragment */
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, ButtonProps } from '@/components/common/Button'
import { useWallet } from '@/stores/WalletService'
import { useMounted } from '@/hooks'

type Props = {
    block?: boolean,
    size?: ButtonProps['size'],
    children: React.ReactNode | React.ReactNode[],
}

export const ConnectButton = observer(({
    block = true,
    size,
    children,
}: Props): JSX.Element | null => {
    const intl = useIntl()
    const wallet = useWallet()
    const mounted = useMounted()

    if (!mounted || wallet.isInitializing) {
        return null
    }

    if (!wallet.hasProvider) {
        return (
            <Button
                block={block}
                size={size}
                type="secondary"
                href="https://chrome.google.com/webstore/detail/ever-wallet/cgeeodpfagjceefieflmdfphplkenlfk"
            >
                {intl.formatMessage({ id: 'WALLET_INSTALLATION_LINK_TEXT' })}
            </Button>
        )
    }

    if (wallet.isConnecting || !wallet.isConnected) {
        return (
            <Button
                block={block}
                size={size}
                type="secondary"
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
            >
                {intl.formatMessage({ id: 'WALLET_MIDDLEWARE_CONNECTION_TITLE' })}
            </Button>
        )
    }

    return (
        <>
            {children}
        </>
    )
})

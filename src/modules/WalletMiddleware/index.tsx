import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { ContentLoader } from '@/components/common/ContentLoader'
import { useWallet } from '@/stores/WalletService'
import { ConnectWallet } from '@/modules/WalletMiddleware/components/ConnectWallet'

import './index.scss'

type Props = {
    message?: string
}

export const WalletMiddleware = observer(({ children, message }: React.PropsWithChildren<Props>): JSX.Element => {
    const wallet = useWallet()

    switch (true) {
        case wallet.isInitializing:
            return <ContentLoader key="loader" />

        case !wallet.isReady:
            return <ConnectWallet key="connector" message={message} />

        case wallet.isReady:
            return <React.Fragment key="children">{children}</React.Fragment>

        default:
            return <div key="empty" />

    }
})

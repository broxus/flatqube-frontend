import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { storage } from '@/utils'
import { useWallet } from '@/stores/WalletService'

import './index.scss'


export const SwapBanner = observer((): React.ReactElement => {
    const intl = useIntl()
    const wallet = useWallet()
    const [available, setAvailable] = React.useState(storage.get('swap_notation') == null)
    const onDismiss = () => {
        storage.set('swap_notation', '1')
        setAvailable(false)
    }

    if (wallet?.isInitializing || wallet?.isUpdatingContract) {
        return <> </>
    }

    if (available && (
        !wallet?.hasProvider
        || !wallet?.isConnected
        || (wallet?.isConnected && wallet?.balance === '0'))
    ) {
        return (
            <div className="card swap-banner-newbie">
                <div>
                    <Button
                        type="icon"
                        className="popup-close"
                        onClick={onDismiss}
                    >
                        <Icon icon="close" />
                    </Button>
                    <div>
                        <h3>{intl.formatMessage({ id: 'GREETING_BANNER_TITLE' })}</h3>
                        {(!wallet?.hasProvider || !wallet?.isConnected) ? (
                            <p>{intl.formatMessage({ id: 'GREETING_BANNER_WALLET_NOT_INSTALLED_NOTE' })}</p>
                        ) : (
                            <>
                                <p>{intl.formatMessage({ id: 'GREETING_BANNER_WALLET_INSTALLED_NOTE_P1' })}</p>
                                <p>{intl.formatMessage({ id: 'GREETING_BANNER_WALLET_INSTALLED_NOTE_P2' })}</p>
                            </>
                        )}
                    </div>
                    <div className="buttons-row">
                        {!wallet?.hasProvider && (
                            <Button
                                block
                                className="swap-notation-btn"
                                type="danger"
                                href="https://l1.broxus.com/everscale/wallet"

                            >
                                {intl.formatMessage({ id: 'WALLET_INSTALLATION_LINK_TEXT' })}
                            </Button>
                        )}
                        {(wallet?.hasProvider && !wallet?.isConnected) && (
                            <Button
                                block
                                className="swap-notation-btn"
                                type="secondary"
                                onClick={wallet?.connect}
                            >
                                {intl.formatMessage({ id: 'EVER_WALLET_CONNECT_BTN_TEXT' })}
                            </Button>
                        )}

                        <Button
                            className="swap-notation-btn"
                            block
                            type="secondary"
                            href="https://docs.flatqube.io/use/getting-started/how-to-get-ever"
                        >
                            {intl.formatMessage({ id: 'GREETING_BANNER_GET_EVER_LINK_TEXT' })}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return <> </>
})

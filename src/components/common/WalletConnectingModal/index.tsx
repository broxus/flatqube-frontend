import * as React from 'react'
import * as ReactDOM from 'react-dom'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useWallet } from '@/stores/WalletService'


export function WalletConnectingModal(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()

    const onClose = () => {
        wallet.setState('isConnecting', false)
    }

    return ReactDOM.createPortal(
        <div className="popup">
            <div className="popup-overlay" />
            <div className="popup__wrap">
                <Button
                    type="icon"
                    className="popup-close"
                    onClick={onClose}
                >
                    <Icon icon="close" />
                </Button>
                <h2 className="popup-title">
                    {intl.formatMessage({
                        id: 'WALLET_CONNECTING_POPUP_TITLE',
                    })}
                </h2>
                <div className="popup-main">
                    <div
                        className={classNames({
                            'popup-main__ava': !wallet.hasProvider,
                            'popup-main__loader': wallet.hasProvider,
                        })}
                    >
                        {wallet.hasProvider && (
                            <Icon icon="loader" />
                        )}
                    </div>
                    <div className="popup-main__name">
                        {intl.formatMessage({
                            id: !wallet.hasProvider
                                ? 'WALLET_CONNECTING_POPUP_LEAD_IN_PROCESS'
                                : 'WALLET_CONNECTING_POPUP_LEAD_WALLET_NAME',
                        })}
                    </div>
                </div>
                <div
                    className="popup-txt"
                    dangerouslySetInnerHTML={{
                        __html: intl.formatMessage({
                            id: 'WALLET_INSTALLATION_NOTE',
                        }),
                    }}
                />
                {!wallet.hasProvider && (
                    <Button
                        block
                        className="popup-btn"
                        ghost
                        href="https://chrome.google.com/webstore/detail/ever-wallet/cgeeodpfagjceefieflmdfphplkenlfk"
                        rel="nofollow noopener noreferrer"
                        size="md"
                        target="_blank"
                        type="tertiary"
                    >
                        {intl.formatMessage({
                            id: 'WALLET_INSTALLATION_LINK_TEXT',
                        })}
                    </Button>
                )}
            </div>
        </div>,
        document.body,
    )
}

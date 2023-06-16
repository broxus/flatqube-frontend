import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcons } from '@/components/common/TokenIcons'
import { storage } from '@/utils'
import { useWallet } from '@/stores/WalletService'
import { NotationPlaceholder } from '@/modules/Swap/components/SwapNotation/NotationPlaceholder'

import './index.scss'


function SwapNotationInternal(): JSX.Element | null {
    const intl = useIntl()
    const wallet = useWallet()
    const [available, setAvailable] = React.useState(storage.get('swap_notation') == null)

    if (wallet?.isInitializing || wallet?.isUpdatingContract) {
        return (
            <NotationPlaceholder />
        )
    }

    if (
        !wallet?.hasProvider
        || !wallet?.isConnected
        || (wallet?.isConnected && wallet?.balance === '0')
    ) {
        return (
            <div className="card swap-notation-newbie">
                <div>
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
                        <p>
                            {!wallet?.hasProvider && (
                                <Button
                                    className="swap-notation-btn"
                                    type="danger"
                                    href="https://l1.broxus.com/everscale/wallet"

                                >
                                    {intl.formatMessage({ id: 'WALLET_INSTALLATION_LINK_TEXT' })}
                                    <Icon icon="externalLink" ratio={0.8} />
                                </Button>
                            )}
                            {(wallet?.hasProvider && !wallet?.isConnected) && (
                                <Button
                                    className="swap-notation-btn"
                                    type="secondary"
                                    onClick={wallet?.connect}
                                >
                                    {intl.formatMessage({ id: 'EVER_WALLET_CONNECT_BTN_TEXT' })}
                                    <Icon icon="externalLink" ratio={0.8} />
                                </Button>
                            )}
                        </p>
                        <p>
                            <Button
                                className="swap-notation-btn"
                                type="secondary"
                                href="https://docs.flatqube.io/use/getting-started/how-to-get-ever"
                            >
                                {intl.formatMessage({ id: 'GREETING_BANNER_GET_EVER_LINK_TEXT' })}
                                <Icon icon="externalLink" ratio={0.8} />
                            </Button>
                        </p>
                    </div>
                </div>

                {/* <footer>
                    <p>
                        {intl.formatMessage({ id: 'GREETING_BANNER_FAQ_NOTE' })}
                    </p>
                    <p>
                        <a
                            className="swap-notation-link"
                            href="https://t.me/FlatQube"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {intl.formatMessage({ id: 'GREETING_BANNER_JOIN_TELEGRAM_LINK_TEXT' })}
                            <Icon icon="chevronRight" />
                        </a>
                    </p>
                </footer> */}
            </div>
        )
    }

    if (wallet?.isConnected && available) {
        const onDismiss = () => {
            storage.set('swap_notation', '1')
            setAvailable(false)
        }

        return (
            <div className="card swap-notation">
                <div>
                    <Button
                        type="icon"
                        className="popup-close"
                        onClick={onDismiss}
                    >
                        <Icon icon="close" />
                    </Button>
                    <div className="swap-notation__icon-holders">
                        <TokenIcons
                            icons={[
                                { icon: 'https://raw.githubusercontent.com/broxus/ton-assets/master/icons/WEVER/logo.svg' },
                                { icon: wallet?.coin.icon },
                            ]}
                            size="small"
                        />
                        <h3>
                            {intl.formatMessage({ id: 'SWAP_COMBINED_NOTATION_TITLE' })}
                        </h3>
                    </div>
                    <div className='buttons-row'>
                        <p>
                            {intl.formatMessage({ id: 'SWAP_COMBINED_NOTATION_P1' })}
                            <br />
                            {intl.formatMessage({ id: 'SWAP_COMBINED_NOTATION_P2' })}
                        </p>
                        <Button
                            className="swap-notation-btn"
                            type="secondary"
                            href="https://docs.flatqube.io/use/swap/how-to/make-a-basic-swap"
                        >
                            <div>
                                {intl.formatMessage({ id: 'SWAP_COMBINED_NOTATION_HOW_TO_LINK_TEXT' })}
                                <Icon icon="externalLink" ratio={0.8} />
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}

export const SwapNotation = observer(SwapNotationInternal)

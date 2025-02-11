import * as React from 'react'
import { observer, Observer } from 'mobx-react-lite'
import Media from 'react-media'
import { Link } from 'react-router-dom'
import { TvmConnectButton, TvmConnector, useTvmWalletService } from '@broxus/tvm-connect/lib'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Navbar } from '@/components/common/Navbar'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { HeaderDrawer } from '@/components/layout/Header/HeaderDrawer'
import { LangSwitcher } from '@/components/layout/LangSwitcher'
import { Logo } from '@/components/layout/Logo'
import { appRoutes } from '@/routes'
import { network } from '@/config'

import './index.scss'


export const Header = observer(() => {
    const intl = useIntl()
    const walletService = useTvmWalletService()
    return (
        <header className="header">
            <Navbar className="width-expand">
                <Media query={{ minWidth: 768 }}>
                    {match => match && (
                        <>
                            <Navbar.Item>
                                <Link to={appRoutes.home.makeUrl()} className="logo">
                                    <Logo />
                                </Link>
                            </Navbar.Item>
                            <DesktopNav />
                            <Navbar.Right className="header-switchers" component={Navbar.Item}>
                                <LangSwitcher />
                                <TvmConnector
                                    connectButtonTrigger={({ connect, disabled }) => (
                                        <Button
                                            aria-disabled={disabled}
                                            disabled={disabled}
                                            type="secondary"
                                            onClick={connect}
                                        >
                                            {intl.formatMessage({
                                                id: 'WALLET_CONNECT_BTN_TEXT',
                                            })}
                                        </Button>
                                    )}
                                    network={network}
                                    standalone={walletService.providers.length === 1}
                                    warnUnsupportedNetwork={false}
                                />
                            </Navbar.Right>
                        </>
                    )}
                </Media>

                <Media query={{ maxWidth: 767 }}>
                    {match => match && (
                        <Observer>
                            {() => (
                                <>
                                    <Navbar.Item>
                                        <Link to={appRoutes.home.makeUrl()} className="logo">
                                            <Logo ratio={0.9} />
                                        </Link>
                                    </Navbar.Item>
                                    <Navbar.Right>
                                        {walletService.isReady ? (
                                            <Navbar.Item
                                                style={{
                                                    justifyContent: 'space-between',
                                                    paddingLeft: 0,
                                                }}
                                            >
                                                <TvmConnector
                                                    connectButtonType="primary"
                                                    showDropMenu={false}
                                                    suffix={<Navbar.Toggle component={HeaderDrawer} icon />}
                                                    warnUnsupportedNetwork={false}
                                                />
                                            </Navbar.Item>
                                        ) : (
                                            <>
                                                <Navbar.Item
                                                    style={{
                                                        justifyContent: 'space-between',
                                                        padding: 0,
                                                    }}
                                                >
                                                    <TvmConnectButton
                                                        popupType="drawer"
                                                        trigger={({ connect, disabled }) => (
                                                            <Button
                                                                aria-disabled={disabled}
                                                                disabled={disabled}
                                                                type="secondary"
                                                                onClick={connect}
                                                            >
                                                                {intl.formatMessage({
                                                                    id: 'WALLET_CONNECT_BTN_TEXT',
                                                                })}
                                                            </Button>
                                                        )}
                                                    />
                                                </Navbar.Item>
                                                <Navbar.Toggle icon>
                                                    <HeaderDrawer />
                                                </Navbar.Toggle>
                                            </>
                                        )}
                                    </Navbar.Right>
                                </>
                            )}
                        </Observer>
                    )}
                </Media>
            </Navbar>
        </header>
    )
})

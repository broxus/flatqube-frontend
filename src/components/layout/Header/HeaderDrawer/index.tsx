import * as React from 'react'
import { reaction } from 'mobx'
import { useIntl } from 'react-intl'
import { TvmConnector, useTvmWalletService, TvmConnectButton } from '@broxus/tvm-connect/lib'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Component } from '@/components/common/Component'
import { LangSwitcher } from '@/components/layout/LangSwitcher'
import { Logo } from '@/components/layout/Logo'
import { DeviceNav } from '@/components/layout/DeviceNav'
import { Drawer, DrawerRef } from '@/components/common/Drawer'
import { useWallet } from '@/stores/WalletService'


export const HeaderDrawer = observer(() => {
    const intl = useIntl()
    const wallet = useWallet()
    const walletService = useTvmWalletService()

    const drawer = React.useRef<DrawerRef | null>(null)

    const collapse = () => {
        drawer.current?.collapse()
    }

    React.useEffect(() => {
        const connectionDisposer = reaction(() => wallet.isConnected, () => {
            collapse()
        })
        return () => {
            connectionDisposer?.()
        }
    }, [])

    return (
        <Drawer
            ref={drawer}
            closable
            destroyOnClose
            /* eslint-disable-next-line react/no-unstable-nested-components */
            trigger={({ expand }) => (
                <Button
                    type="icon"
                    className="btn-open-drawer"
                    onClick={expand}
                >
                    <Icon icon="menu" />
                </Button>
            )}
            width="100vw"
        >
            <Component className="device-drawer-content-inner">
                <div className="device-drawer-header">
                    <div className="logo">
                        <Logo ratio={0.9} />
                    </div>

                    <div className="device-drawer-header-inner">
                        {wallet.isConnected && (
                            <TvmConnector
                                popupType="drawer"
                                showDropMenu={false}
                                standalone={walletService.providers.length === 1}
                            />
                        )}

                        <Button
                            type="icon"
                            className="btn-close-drawer"
                            onClick={collapse}
                        >
                            <Icon icon="close" />
                        </Button>
                    </div>
                </div>
                <DeviceNav onNavigate={collapse} />
                <LangSwitcher />
                <div className="device-drawer-footer">
                    {wallet.isConnected ? (
                        <Button
                            block
                            size="md"
                            type="secondary"
                            onClick={wallet.disconnect}
                        >
                            {intl.formatMessage({
                                id: 'WALLET_DISCONNECT_BTN_TEXT',
                            })}
                        </Button>
                    ) : (
                        <TvmConnectButton
                            popupType="drawer"
                            trigger={({ connect, disabled }) => (
                                <Button
                                    aria-disabled={disabled}
                                    block
                                    disabled={disabled}
                                    size="md"
                                    type="primary"
                                    onClick={connect}
                                >
                                    {intl.formatMessage({
                                        id: 'EVER_WALLET_CONNECT_BTN_TEXT',
                                    })}
                                </Button>
                            )}
                        />
                    )}
                </div>
            </Component>
        </Drawer>
    )
})

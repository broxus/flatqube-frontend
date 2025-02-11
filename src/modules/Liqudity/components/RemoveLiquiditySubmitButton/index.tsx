import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'
import { TvmConnectButton } from '@broxus/tvm-connect/lib'
import { useConfig } from '@broxus/react-uikit'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useRemoveLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { useNotifiedWithdrawLiquidityCallbacks } from '@/modules/Liqudity/hooks'

function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const config = useConfig()
    const formStore = useRemoveLiquidityFormStoreContext()
    const withdrawLiquidityCallbacks = useNotifiedWithdrawLiquidityCallbacks({})

    if (!formStore.wallet.isConnected && !formStore.isPreparing) {
        return (
            <Media query={{ minWidth: config.breakpoints.m ?? 960 }}>
                {match => (
                    <TvmConnectButton
                        popupType={match ? undefined : 'drawer'}
                        trigger={({ connect, disabled }) => (
                            <Button
                                aria-disabled={disabled}
                                block
                                disabled={disabled}
                                size="lg"
                                type="primary"
                                onClick={connect}
                            >
                                {intl.formatMessage({
                                    id: 'EVER_WALLET_CONNECT_BTN_TEXT',
                                })}
                            </Button>
                        )}
                        standalone={formStore.wallet.service.providers?.length === 1}
                    >
                        {intl.formatMessage({
                            id: 'EVER_WALLET_CONNECT_BTN_TEXT',
                        })}
                    </TvmConnectButton>
                )}
            </Media>
        )
    }

    if (
        formStore.isPreparing === undefined
        || formStore.isPreparing
        || formStore.isSyncingPool === undefined
        || formStore.isSyncingPool
        || formStore.isWithdrawingLiquidity
    ) {
        return (
            <Button
                aria-disabled="true"
                block
                disabled
                size="lg"
                type="primary"
            >
                <Icon icon="loader" className="spin" />
            </Button>
        )
    }

    const buttonProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> = {
        disabled: true,
    }
    let buttonText = intl.formatMessage({ id: 'LIQUIDITY_REMOVE_BTN_TEXT_SUBMIT' })

    switch (true) {
        case formStore.isAwaitingConfirmation:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({ id: 'LIQUIDITY_REMOVE_BTN_TEXT_CONFIRMATION_AWAIT' })
            break

        case formStore.amount === '':
            buttonProps.disabled = true
            buttonText = intl.formatMessage({ id: 'LIQUIDITY_REMOVE_BTN_TEXT_ENTER_AN_AMOUNT' })
            break

        case formStore.isWithdrawLiquidityAvailable:
            buttonProps.disabled = formStore.isWithdrawingLiquidity || !formStore.isAmountValid
            buttonProps.onClick = async () => {
                await formStore.withdrawLiquidity(withdrawLiquidityCallbacks)
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_REMOVE_BTN_TEXT_SUBMIT',
            })
            break

        default:
    }

    return (
        <Button
            aria-disabled={buttonProps.disabled}
            block
            size="lg"
            type="primary"
            {...buttonProps}
        >
            {buttonText}
        </Button>
    )
}

export const RemoveLiquiditySubmitButton = observer(SubmitButton)

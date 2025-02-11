import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { TvmConnectButton } from '@broxus/tvm-connect/lib'
import Media from 'react-media'
import { useConfig } from '@broxus/react-uikit'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { SwapDirection } from '@/modules/Swap/types'


function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const config = useConfig()
    const formStore = useSwapFormStoreContext()

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
                                className="form-submit"
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
        || formStore.isCalculating
        || formStore.isProcessing
    ) {
        return (
            <Button
                block
                size="lg"
                type="primary"
                className="form-submit"
                aria-disabled="true"
                disabled
            >
                <Icon icon="loader" className="spin" />
            </Button>
        )
    }

    const buttonProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> = {}
    let buttonText: React.ReactNode = intl.formatMessage({ id: 'SWAP_BTN_TEXT_SUBMIT' })

    switch (true) {
        case formStore.leftToken === undefined || formStore.rightToken === undefined:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_SELECT_A_TOKEN',
            })
            break

        case (formStore.leftAmount.length > 0 || formStore.rightAmount.length > 0) && formStore.route === undefined:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_NOT_ENOUGH_LIQUIDITY',
            })
            break

        case formStore.leftAmount.length === 0 && formStore.direction === SwapDirection.LTR:
        case formStore.rightAmount.length === 0 && formStore.direction === SwapDirection.RTL:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_ENTER_AN_AMOUNT',
            })
            break

        case !formStore.isLeftAmountValid:
            buttonProps.disabled = true
            buttonText = formStore.isComboSwapMode ? intl.formatMessage({
                id: 'SWAP_BTN_TEXT_INSUFFICIENT_BALANCE',
            }) : intl.formatMessage({
                id: 'SWAP_BTN_TEXT_INSUFFICIENT_TOKEN_BALANCE',
            }, {
                // eslint-disable-next-line react/no-multi-comp,react/destructuring-assignment,react/no-unstable-nested-components
                s: parts => `<span class="truncate-name">${parts.join('')}</span>`,
                symbol: (formStore.coinSide === 'leftToken' ? formStore.wallet.coin.symbol : formStore.leftToken?.symbol) || '',
            })
            break

        case formStore.isConfirmationAwait:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_CONFIRMATION_AWAIT',
            })
            break

        case formStore.isValid:
            buttonProps.onClick = () => {
                formStore.setState('isConfirmationAwait', true)
            }
            break

        default:
            buttonProps.disabled = !formStore.isValid || formStore.isProcessing
    }

    return (
        <Button
            block
            size="lg"
            type="primary"
            className="form-submit"
            aria-disabled={buttonProps.disabled}
            {...buttonProps}
            dangerouslySetInnerHTML={{
                __html: buttonText as string,
            }}
        />
    )
}

export const SwapSubmitButton = observer(SubmitButton)

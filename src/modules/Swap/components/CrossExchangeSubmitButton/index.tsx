import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { SwapDirection } from '@/modules/Swap/types'


function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const formStore = useSwapFormStoreContext()

    if (
        formStore.isPreparing
        || formStore.isSwapping
        || formStore.isCalculating
        || formStore.isLoading
        || !formStore.tokensCache.isReady
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
                <div className="popup-main__loader">
                    <Icon icon="loader" />
                </div>
            </Button>
        )
    }

    const buttonProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> = {}
    let buttonText: React.ReactNode = intl.formatMessage({ id: 'SWAP_BTN_TEXT_SUBMIT' })

    switch (true) {
        case formStore.wallet.account === undefined:
            buttonProps.disabled = formStore.wallet.isConnecting
            buttonProps.onClick = async () => {
                await formStore.wallet.connect()
            }
            buttonText = intl.formatMessage({
                id: 'EVER_WALLET_CONNECT_BTN_TEXT',
            })
            break

        case formStore.leftToken === undefined || formStore.rightToken === undefined:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_SELECT_A_TOKEN',
            })
            break

        case formStore.leftAmount.length === 0 && formStore.direction === SwapDirection.LTR:
        case formStore.rightAmount.length === 0 && formStore.direction === SwapDirection.RTL:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_ENTER_AN_AMOUNT',
            })
            break

        case !formStore.isCrossExchangeAvailable:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_ROUTE_DOES_NOT_EXIST',
            })
            break

        case !formStore.isLeftAmountValid:
            buttonProps.disabled = true
            // @ts-ignore need react 18
            buttonText = intl.formatMessage({
                id: 'SWAP_BTN_TEXT_INSUFFICIENT_TOKEN_BALANCE',
            }, {
                // eslint-disable-next-line react/no-multi-comp,react/destructuring-assignment,react/no-unstable-nested-components
                s: parts => `<span class="truncate-name">${parts.join('')}</span>`,
                symbol: formStore.leftToken?.symbol || '',
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
            buttonProps.disabled = !formStore.isValid || formStore.isLoading
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

export const CrossExchangeSubmitButton = observer(SubmitButton)

import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'
import { TvmConnectButton } from '@broxus/tvm-connect/lib'
import { useConfig } from '@broxus/react-uikit'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import { useNotifiedConversionCallbacks } from '@/modules/Swap/hooks/useNotifiedConversionCallbacks'


function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const config = useConfig()
    const formStore = useSwapFormStoreContext()
    const conversionCallbacks = useNotifiedConversionCallbacks({})

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

    const buttonProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> = { disabled: true }
    let buttonText: React.ReactNode = intl.formatMessage({ id: 'CONVERSION_FORM_SUBMIT_BTN_TEXT' })

    if (formStore.isWrapMode) {
        buttonText = intl.formatMessage({
            id: 'CONVERSION_FORM_WRAP_BTN_TEXT',
        }, { symbol: formStore.wallet.coin.symbol })
    }
    else if (formStore.isUnwrapMode) {
        buttonText = intl.formatMessage({
            id: 'CONVERSION_FORM_UNWRAP_BTN_TEXT',
        }, { symbol: formStore.leftToken?.symbol })
    }

    switch (true) {
        case formStore.isWrapMode && formStore.isWrapValid:
            buttonProps.disabled = false
            buttonProps.onClick = async () => {
                await formStore.wrap(conversionCallbacks)
            }
            break

        case formStore.isUnwrapMode && formStore.isUnwrapValid:
            buttonProps.disabled = false
            buttonProps.onClick = async () => {
                await formStore.unwrap(conversionCallbacks)
            }
            break

        default:
    }

    return (
        <Button
            block
            size="lg"
            type="primary"
            className="form-submit"
            aria-disabled={buttonProps.disabled}
            {...buttonProps}
        >
            {buttonText}
        </Button>
    )
}

export const ConversionSubmitButton = observer(SubmitButton)

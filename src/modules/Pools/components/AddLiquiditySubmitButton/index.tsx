import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { isAddressValid } from '@/misc'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import { useNotifiedDepositLiquidityCallbacks } from '@/modules/Pools/hooks/useNotifiedDepositLiquidityCallbacks'
import { useNotifiedDepositTokenCallbacks } from '@/modules/Pools/hooks/useNotifiedDepositTokenCallbacks'
import { useNotifiedPoolConnectionCallbacks } from '@/modules/Pools/hooks/useNotifiedPoolConnectionCallbacks'
import { useFavoritePools } from '@/stores/FavoritePairs'


function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()
    const poolConnectionCallbacks = useNotifiedPoolConnectionCallbacks({})
    const tokenDepositCallbacks = useNotifiedDepositTokenCallbacks({})
    const liquidityDepositCallbacks = useNotifiedDepositLiquidityCallbacks({
        onTransactionSuccess: (_, receipt) => {
            if (isAddressValid(receipt.poolAddress?.toString())) {
                const faves = useFavoritePools()
                faves.add(receipt.poolAddress.toString())
            }
        },
    })

    if (formStore.isPreparing) {
        return (
            <Button
                aria-disabled="true"
                block
                className="form-submit"
                disabled
                size="lg"
                type="primary"
            >
                {intl.formatMessage({
                    id: 'LIQUIDITY_ADD_BTN_TEXT_PREPARING',
                })}
            </Button>
        )
    }

    const buttonProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> = {
        disabled: false,
    }
    let buttonText = intl.formatMessage({ id: 'LIQUIDITY_ADD_BTN_TEXT_SUBMIT' })

    switch (true) {
        case formStore.isCheckingDexAccount === undefined || formStore.isCheckingDexAccount:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CHECK_ACCOUNT',
            })
            break

        case formStore.isConnectingDexAccount:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CONNECTING_ACCOUNT',
            })
            break

        case formStore.isConnectingPool:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CONNECTING_POOL',
            })
            break

        case formStore.isDepositingLiquidity:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_SUPPLYING',
            })
            break

        case formStore.dex.address === undefined && formStore.isCheckingDexAccount === false:
            buttonProps.disabled = false
            buttonProps.onClick = async () => {
                await formStore.connectDexAccount()
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CONNECT_ACCOUNT',
            })
            break

        case formStore.isSyncingPool === undefined || formStore.isSyncingPool:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CHECK_PAIR',
            })
            break

        case !formStore.isPoolConnected && formStore.isSyncingPool === false:
            buttonProps.disabled = false
            buttonProps.onClick = async () => {
                await formStore.connectPool(poolConnectionCallbacks)
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CONNECT_POOL',
            })
            break

        case formStore.isAmountsEmpty:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_ENTER_AN_AMOUNT',
            })
            break

        case formStore.isAmountsValid: {
            const tokenForDeposit = formStore.tokens.find(
                token => formStore.isTokenAvailableToDeposit(token.address.toString()),
            )

            if (tokenForDeposit !== undefined) {
                const address = tokenForDeposit.address.toString()
                buttonProps.disabled = formStore.isTokenAwaitingDeposit(address)
                buttonProps.onClick = async () => {
                    if (buttonProps.disabled) {
                        return
                    }

                    await formStore.depositToken(address, tokenDepositCallbacks)
                }
                buttonText = intl.formatMessage(
                    { id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSIT_TOKEN' },
                    { symbol: tokenForDeposit.symbol ?? '' },
                )
                break
            }

            if (formStore.isTokensDepositing) {
                buttonProps.disabled = true
                buttonText = intl.formatMessage({
                    id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSITING_TOKEN',
                }, { symbol: formStore.lastDepositingToken?.symbol ?? '' })
                break
            }

            buttonProps.disabled = formStore.isDepositingLiquidity
            buttonProps.onClick = async () => {
                if (buttonProps.disabled) {
                    return
                }
                await formStore.supply(liquidityDepositCallbacks)
            }
            buttonText = intl.formatMessage({ id: 'LIQUIDITY_ADD_BTN_TEXT_SUPPLY' })
        } break

        case !formStore.isAmountsValid:
            buttonProps.disabled = true
            buttonText = intl.formatMessage(
                { id: 'LIQUIDITY_ADD_BTN_TEXT_INSUFFICIENT_TOKEN_BALANCE' },
                { symbol: formStore.firstInvalidAmountToken?.symbol ?? '' },
            )
            break

        default:
    }

    if (!formStore.wallet.address) {
        buttonProps.disabled = formStore.wallet.isConnecting
        buttonProps.onClick = async () => {
            await formStore.wallet.connect()
        }
        buttonText = intl.formatMessage({
            id: 'EVER_WALLET_CONNECT_BTN_TEXT',
        })
    }

    return (
        <Button
            aria-disabled={buttonProps.disabled}
            className="form-submit"
            block
            size="lg"
            type="primary"
            {...buttonProps}
        >
            {buttonText}
        </Button>
    )
}

export const AddLiquiditySubmitButton = observer(SubmitButton)

import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { isAddressValid } from '@/misc'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import {
    useNotifiedDepositLiquidityCallbacks,
    useNotifiedDepositTokenCallbacks,
    useNotifiedPoolConnectionCallbacks,
    useNotifiedPoolCreationCallbacks,
} from '@/modules/Liqudity/hooks'
import { useFavoritePools } from '@/stores/FavoritePairs'
import { isGoodBignumber } from '@/utils'


function SubmitButton(): JSX.Element {
    const intl = useIntl()
    const formStore = useAddLiquidityFormStoreContext()
    const poolConnectionCallbacks = useNotifiedPoolConnectionCallbacks({})
    const poolCreationCallbacks = useNotifiedPoolCreationCallbacks({})
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
        disabled: true,
    }
    let buttonText = intl.formatMessage({ id: 'LIQUIDITY_ADD_BTN_TEXT_SUBMIT' })

    const isLeftAmountEmpty = !isGoodBignumber(formStore.leftAmount)
    const isRightAmountEmpty = !isGoodBignumber(formStore.rightAmount)

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

        case formStore.isCreatingPool:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CREATING_POOL',
            })
            break

        case formStore.isConnectingPool:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CONNECTING_POOL',
            })
            break

        case formStore.isDepositingLeft && formStore.isEnoughDexRightBalance:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSITING_TOKEN',
            }, { symbol: formStore.leftToken?.symbol ?? '' })
            break

        case formStore.isDepositingRight:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSITING_TOKEN',
            }, { symbol: formStore.rightToken?.symbol ?? '' })
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

        case formStore.leftToken === undefined || formStore.rightToken === undefined:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_SELECT_PAIR',
            })
            break

        case formStore.isSyncingPool === undefined || formStore.isSyncingPool:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CHECK_PAIR',
            })
            break

        case formStore.pool?.address === undefined && formStore.isSyncingPool === false:
            buttonProps.disabled = false
            buttonProps.onClick = async () => {
                await formStore.createPool(poolCreationCallbacks)
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_CREATE_POOL',
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

        case !isLeftAmountEmpty && !formStore.isEnoughDexLeftBalance && !formStore.isDepositingLeft:
            buttonProps.disabled = formStore.isAwaitingLeftDeposit || !formStore.isLeftAmountValid
            buttonProps.onClick = async () => {
                if (buttonProps.disabled) {
                    return
                }

                if (formStore.leftToken?.root !== undefined) {
                    await formStore.depositLeftToken(tokenDepositCallbacks)
                }
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSIT_TOKEN',
            }, {
                symbol: formStore.leftToken?.symbol ?? '',
            })
            break

        case !isRightAmountEmpty && !formStore.isEnoughDexRightBalance:
            buttonProps.disabled = (
                formStore.isAwaitingRightDeposit
                || formStore.isDepositingRight
                || !formStore.isRightAmountValid
            )
            buttonProps.onClick = async () => {
                if (buttonProps.disabled) {
                    return
                }

                if (formStore.rightToken?.root !== undefined) {
                    await formStore.depositRightToken(tokenDepositCallbacks)
                }
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_DEPOSIT_TOKEN',
            }, {
                symbol: formStore.rightToken?.symbol ?? '',
            })
            break

        case formStore.isSupplyReady:
            buttonProps.disabled = (
                formStore.isDepositingLiquidity
                || formStore.isWithdrawingLeftToken
                || formStore.isWithdrawingRightToken
            )
            buttonProps.onClick = async () => {
                if (buttonProps.disabled) {
                    return
                }
                await formStore.supply(liquidityDepositCallbacks)
            }
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_SUPPLY',
            })
            break

        case isLeftAmountEmpty || isRightAmountEmpty:
            buttonProps.disabled = true
            buttonText = intl.formatMessage({
                id: 'LIQUIDITY_ADD_BTN_TEXT_ENTER_AN_AMOUNT',
            })
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

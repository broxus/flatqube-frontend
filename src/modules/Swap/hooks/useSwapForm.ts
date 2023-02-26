import * as React from 'react'
import { useHistory } from 'react-router-dom'

import { isAddressValid } from '@/misc'
import { COIN_URL_PARAM, COMBINED_URL_PARAM } from '@/modules/Swap/constants'
import { useSwapFormStoreContext } from '@/modules/Swap/context'
import type { BaseSwapStoreData } from '@/modules/Swap/stores/BaseSwapStore'
import type { TokenSide } from '@/modules/TokensList'
import { appRoutes } from '@/routes'
import { debounce, debug, error } from '@/utils'


type SwapFormShape = {
    isTokenListShown: boolean;
    tokenSide: TokenSide | undefined;
    hideTokensList: () => void;
    resolveStateFromUrl: (leftRoot?: string, rightRoot?: string) => Promise<void>;
    showTokensList: (side: TokenSide) => () => void;
    toggleConversionDirection: () => void;
    toggleSwapDirection: () => void;
    onChangeLeftAmount: (value: BaseSwapStoreData['leftAmount']) => void;
    onChangeRightAmount: (value: BaseSwapStoreData['rightAmount']) => void;
    onSelectMultipleSwap: () => void;
    onSelectLeftNativeCoin: () => void;
    onSelectRightNativeCoin: () => void;
    onSelectLeftToken: (root: string) => void;
    onSelectRightToken: (root: string) => void;
    onLeftImportConfirm: (leftRoot: string, rightRoot?: string) => void;
    onRightImportConfirm: (leftRoot: string, rightRoot: string) => void;
}


export function useSwapForm(): SwapFormShape {
    const formStore = useSwapFormStoreContext()
    const history = useHistory()

    const [isTokenListShown, setTokenListVisible] = React.useState(false)

    const [tokenSide, setTokenSide] = React.useState<TokenSide>()

    const hideTokensList = () => {
        setTokenSide(undefined)
        setTokenListVisible(false)
    }

    const showTokensList = (side: TokenSide) => () => {
        if (formStore.isProcessing) {
            return
        }
        setTokenSide(side)
        setTokenListVisible(true)
    }

    const resolveStateFromUrl = async (leftRoot?: string, rightRoot?: string) => {
        const isLeftRootAvailable = isAddressValid(formStore.leftToken?.root)
        const isRightRootAvailable = isAddressValid(formStore.rightToken?.root)
        const isLeftRootValid = isAddressValid(leftRoot)
        const isRightRootValid = isAddressValid(rightRoot)
        const isLeftCoin = leftRoot === COIN_URL_PARAM || formStore.coinSide === 'leftToken'
        const isRightCoin = rightRoot === COIN_URL_PARAM || formStore.coinSide === 'rightToken'
        const isCombined = leftRoot === COMBINED_URL_PARAM || (
            !isLeftRootValid && !isRightRootValid && !isLeftCoin && !isRightCoin
        )
        const isWrap = isLeftCoin && rightRoot === formStore.wrappedCoinTokenAddress.toString()
        const isUnwrap = isRightCoin && leftRoot === formStore.wrappedCoinTokenAddress.toString()

        if (isLeftRootAvailable && isRightRootAvailable && !isLeftRootValid && !isRightRootValid) {
            return
        }

        if (isLeftRootValid && isRightRootValid) {
            formStore.setState({
                coinSide: undefined,
                isCombo: false,
            })
            formStore.setData({
                leftToken: leftRoot,
                rightToken: rightRoot,
            })
        }
        else if (isLeftCoin) {
            formStore.setState({
                coinSide: 'leftToken',
                isCombo: false,
            })
            formStore.setData({
                leftToken: isWrap ? undefined : formStore.wrappedCoinTokenAddress.toString(),
                rightToken: rightRoot ?? formStore.rightToken?.root,
            })
        }
        else if (isRightCoin) {
            formStore.setState({
                coinSide: 'rightToken',
                isCombo: false,
            })
            formStore.setData('leftToken', leftRoot ?? formStore.leftToken?.root)
            if (isUnwrap) {
                formStore.setData('rightToken', undefined)
            }
            else {
                formStore.setData('rightToken', formStore.wrappedCoinTokenAddress.toString())
            }
        }
        else if (isLeftRootValid && !isRightRootValid) {
            formStore.setState({
                coinSide: undefined,
                isCombo: false,
            })
            formStore.setData({
                leftToken: leftRoot ?? formStore.leftToken?.root,
                rightToken: undefined,
            })
        }
        else if (isCombined) {
            formStore.setData({
                leftToken: formStore.defaultLeftTokenRoot,
                rightToken: rightRoot ?? formStore.rightToken?.root ?? formStore.defaultRightTokenRoot,
            })
            formStore.setState('isCombo', true)
        }

        if (formStore.tokensCache.isReady) {
            const leftInCache = formStore.tokensCache.has(leftRoot)
            const rightInCache = formStore.tokensCache.has(rightRoot)

            try {
                if (isLeftRootValid && !leftInCache && !isLeftCoin) {
                    debug('Try to fetch left token')
                    await formStore.tokensCache.addToImportQueue(leftRoot)
                }
            }
            catch (e) {
                error('Left token import error', e)
                formStore.setData('leftToken', undefined)
            }

            try {
                if (isRightRootValid && !rightInCache && !isRightCoin) {
                    debug('Try to fetch right token')
                    await formStore.tokensCache.addToImportQueue(rightRoot)
                }
            }
            catch (e) {
                error('Right token import error', e)
                formStore.setData('rightToken', undefined)
            }
        }
    }

    const toggleSwapDirection = async () => {
        if (formStore.isProcessing) {
            return
        }

        await formStore.toggleDirection()

        let leftParam = formStore.leftToken?.root ?? '',
            rightParam = formStore.rightToken?.root ?? ''

        if (formStore.coinSide === 'rightToken') {
            rightParam = COIN_URL_PARAM
        }
        else if (formStore.coinSide === 'leftToken') {
            leftParam = COIN_URL_PARAM
        }

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: leftParam,
            rightTokenRoot: rightParam,
        }))
    }

    const toggleConversionDirection = async () => {
        if (formStore.isProcessing) {
            return
        }

        await formStore.toggleConversionDirection()

        const leftParam = formStore.isWrapMode ? COIN_URL_PARAM : formStore.wrappedCoinTokenAddress.toString()
        const rightParam = formStore.isWrapMode ? formStore.wrappedCoinTokenAddress.toString() : COIN_URL_PARAM

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: leftParam,
            rightTokenRoot: rightParam,
        }))
    }

    const onKeyPress = React.useCallback(debounce(async () => {
        await formStore.recalculate(true)
        formStore.setState('isCalculating', false)
    }, 400), [formStore.isCalculating])

    const onKeyPressDelayed = React.useCallback(debounce(async () => {
        await formStore.recalculate(true)
        formStore.setState('isCalculating', false)
    }, 1000), [formStore.isCalculating])

    const debouncedLeftAmount = React.useCallback(debounce((value: string) => {
        formStore.setData('leftAmount', value)
    }, 400), [formStore.isCalculating])

    const debouncedRightAmount = React.useCallback(debounce((value: string) => {
        formStore.setData('rightAmount', value)
    }, 400), [formStore.isCalculating])

    const onChangeLeftAmount: SwapFormShape['onChangeLeftAmount'] = async value => {
        if (formStore.isDepositOneCoinMode || formStore.isWithdrawOneCoinMode) {
            formStore.setState('isCalculating', value.length > 0)
            await formStore.changeLeftAmount(value, onKeyPress)
        }
        else if (formStore.isConversionMode) {
            formStore.setData('leftAmount', value)
            debouncedRightAmount(value)
        }
        else {
            formStore.setState('isCalculating', value.length > 0)
            await formStore.changeLeftAmount(value, onKeyPressDelayed)
        }
    }

    const onChangeRightAmount: SwapFormShape['onChangeRightAmount'] = async value => {
        if (formStore.isDepositOneCoinMode || formStore.isWithdrawOneCoinMode) {
            formStore.setState('isCalculating', value.length > 0)
            await formStore.changeRightAmount(value, onKeyPress)
        }
        else if (formStore.isConversionMode) {
            formStore.setData('rightAmount', value)
            debouncedLeftAmount(value)
        }
        else {
            formStore.setState('isCalculating', value.length > 0)
            await formStore.changeRightAmount(value, onKeyPressDelayed)
        }
    }

    const onSelectMultipleSwap = async () => {
        hideTokensList()

        if (formStore.isConversionMode) {
            formStore.setData('rightToken', formStore.defaultRightTokenRoot)
        }

        formStore.setState({
            coinSide: undefined,
            isCombo: true,
        })

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: COMBINED_URL_PARAM,
            rightTokenRoot: formStore.rightToken?.root ?? '',
        }))

        await formStore.changeLeftToken(formStore.wrappedCoinTokenAddress.toString())
    }

    const onSelectLeftNativeCoin = async () => {
        hideTokensList()

        switch (true) {
            case formStore.isComboSwapMode:
                formStore.setState({
                    coinSide: 'leftToken',
                    isCombo: false,
                })
                formStore.setData('leftToken', formStore.wrappedCoinTokenAddress.toString())
                break

            case formStore.isUnwrapMode:
                formStore.setState('coinSide', 'leftToken')
                formStore.setData({
                    leftToken: undefined,
                    rightToken: formStore.wrappedCoinTokenAddress.toString(),
                })
                break

            default:
                formStore.setState('coinSide', 'leftToken')
                if (formStore.rightToken?.root === formStore.wrappedCoinTokenAddress.toString()) {
                    formStore.setData('leftToken', undefined)
                }
                else {
                    formStore.setData('leftToken', formStore.wrappedCoinTokenAddress.toString())
                }
        }

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: COIN_URL_PARAM,
            rightTokenRoot: formStore.rightToken?.root ?? '',
        }))

        await formStore.changeLeftToken(formStore.leftToken?.root)
    }

    const onSelectRightNativeCoin = async () => {
        hideTokensList()

        switch (true) {
            case formStore.isComboSwapMode:
                formStore.setState({
                    coinSide: 'rightToken',
                    isCombo: false,
                })
                formStore.setData({
                    leftToken: formStore.wrappedCoinTokenAddress.toString(),
                    rightAmount: formStore.leftAmount,
                    rightToken: undefined,
                })
                break

            case formStore.isWrapMode:
                formStore.setState('coinSide', 'rightToken')
                formStore.setData({
                    leftToken: formStore.wrappedCoinTokenAddress.toString(),
                    rightToken: undefined,
                })
                break

            default:
                formStore.setState('coinSide', 'rightToken')
                if (formStore.leftToken?.root === formStore.wrappedCoinTokenAddress.toString()) {
                    formStore.setData('rightToken', undefined)
                }
                else {
                    formStore.setData('rightToken', formStore.wrappedCoinTokenAddress.toString())
                }
        }

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: formStore.leftToken?.root ?? '',
            rightTokenRoot: COIN_URL_PARAM,
        }))

        await formStore.changeLeftToken(formStore.leftToken?.root)
    }

    const onSelectLeftToken: SwapFormShape['onSelectLeftToken'] = async root => {
        hideTokensList()

        switch (true) {
            // from ever+wever/tip3 to tip3/tip3
            case formStore.isComboSwapMode:
                formStore.setState({
                    coinSide: undefined,
                    isCombo: false,
                })
                formStore.setData('leftToken', root)
                if (root === formStore.rightToken?.root) {
                    formStore.setData('rightToken', formStore.wrappedCoinTokenAddress.toString())
                }
                break

            // from ever/wever
            case formStore.isWrapMode:
                if (root === formStore.wrappedCoinTokenAddress.toString()) { // to wever/ever
                    formStore.setState('coinSide', 'rightToken')
                    formStore.setData({
                        leftToken: root,
                        rightToken: undefined,
                    })
                }
                else { // to tip3/tip3
                    formStore.setState('coinSide', undefined)
                    formStore.setData('leftToken', root)
                }
                break

            // from wever/ever to tip3/tip3
            case formStore.isUnwrapMode:
                formStore.setData({
                    leftToken: root,
                    rightToken: formStore.wrappedCoinTokenAddress.toString(),
                })
                break

            // from ever/tip3 to tip3/tip3
            case formStore.coinSide === 'leftToken':
                if (root === formStore.rightToken?.root) {
                    formStore.setState('coinSide', 'rightToken')
                    formStore.setData({
                        leftToken: root,
                        rightToken: formStore.wrappedCoinTokenAddress.toString(),
                    })
                }
                else {
                    formStore.setState('coinSide', undefined)
                    formStore.setData('leftToken', root)
                }
                break

            // from tip3/ever
            case formStore.coinSide === 'rightToken':
                if (root === formStore.wrappedCoinTokenAddress.toString()) { // to wever/ever
                    formStore.setData('rightToken', undefined)
                }
                else { // to tip3/tip3
                    formStore.setData('rightToken', formStore.wrappedCoinTokenAddress.toString())
                }
                formStore.setData('leftToken', root)
                break

            default:
        }

        history.replace(appRoutes.swap.makeUrl({
            leftTokenRoot: root,
            rightTokenRoot: formStore.coinSide === 'rightToken' ? COIN_URL_PARAM : (formStore.rightToken?.root ?? ''),
        }))

        await formStore.changeLeftToken(root)
    }

    const onSelectRightToken: SwapFormShape['onSelectRightToken'] = async root => {
        hideTokensList()

        const navigate = () => {
            let leftParam = formStore.leftToken?.root

            if (formStore.coinSide === 'leftToken') {
                leftParam = COIN_URL_PARAM
            }

            if (formStore.isComboSwapMode) {
                leftParam = COMBINED_URL_PARAM
            }

            if (leftParam !== undefined) {
                history.replace(appRoutes.swap.makeUrl({
                    leftTokenRoot: leftParam,
                    rightTokenRoot: root,
                }))
            }
        }

        switch (true) {
            // from ever+wever/tip3
            case formStore.isComboSwapMode:
                if (root === formStore.wrappedCoinTokenAddress.toString()) { // to ever/wever
                    formStore.setState({
                        coinSide: 'leftToken',
                        isCombo: false,
                    })
                    formStore.setData({
                        leftToken: undefined,
                        rightAmount: formStore.leftAmount,
                        rightToken: root,
                    })
                }
                else { // to new tip3
                    formStore.setData('rightToken', root)
                }
                break

            // from ever/wever to tip3/tip3
            case formStore.isWrapMode:
                formStore.setData({
                    leftToken: formStore.wrappedCoinTokenAddress.toString(),
                    rightToken: root,
                })
                break

            // from wever/ever
            case formStore.isUnwrapMode:
                if (root === formStore.wrappedCoinTokenAddress.toString()) { // to ever/wever
                    formStore.setState('coinSide', 'leftToken')
                    formStore.setData({
                        leftToken: undefined,
                        rightToken: root,
                    })
                }
                else { // to tip3/tip3
                    formStore.setState('coinSide', undefined)
                    formStore.setData('rightToken', root)
                }
                break

            // from ever/tip3
            case formStore.coinSide === 'leftToken':
                if (root === formStore.wrappedCoinTokenAddress.toString()) { // to ever/wever
                    formStore.setData('leftToken', undefined)
                }
                else { // to tip3/tip3
                    formStore.setData('leftToken', formStore.wrappedCoinTokenAddress.toString())
                }
                formStore.setData('rightToken', root)
                break

            // from tip3/ever to tip3/tip3
            case formStore.coinSide === 'rightToken':
                if (root === formStore.leftToken?.root) {
                    formStore.setState('coinSide', 'leftToken')
                    formStore.setData({
                        leftToken: formStore.wrappedCoinTokenAddress.toString(),
                        rightToken: root,
                    })
                }
                else {
                    formStore.setState('coinSide', undefined)
                    formStore.setData('rightToken', root)
                }
                break

            default:
        }

        navigate()

        await formStore.changeRightToken(root)
    }

    const onLeftImportConfirm: SwapFormShape['onLeftImportConfirm'] = async (leftRoot: string, rightRoot?: string) => {
        await onSelectLeftToken(leftRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    const onRightImportConfirm: SwapFormShape['onRightImportConfirm'] = async (leftRoot: string, rightRoot: string) => {
        await onSelectRightToken(rightRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    return {
        hideTokensList,
        isTokenListShown,
        resolveStateFromUrl,
        showTokensList,
        toggleConversionDirection,
        toggleSwapDirection,
        tokenSide,
        // eslint-disable-next-line sort-keys
        onChangeLeftAmount,
        onChangeRightAmount,
        onLeftImportConfirm,
        onRightImportConfirm,
        onSelectLeftNativeCoin,
        onSelectLeftToken,
        onSelectMultipleSwap,
        onSelectRightNativeCoin,
        onSelectRightToken,
    }
}

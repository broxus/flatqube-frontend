import * as React from 'react'
import { useHistory } from 'react-router-dom'

import { isAddressValid } from '@/misc'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import type { AddLiquidityFormStoreData } from '@/modules/Liqudity/stores'
import { TokenSide } from '@/modules/TokensList'
import { debug, error } from '@/utils'
import { appRoutes } from '@/routes'


type PoolFormShape = {
    isTokenListShown: boolean;
    tokenSide: TokenSide | undefined;
    hideTokensList: () => void;
    resolveStateFromUrl: (leftRoot?: string, rightRoot?: string) => Promise<void>;
    showTokensList: (side: TokenSide) => () => void;
    onChangeLeftAmount: (value: AddLiquidityFormStoreData['leftAmount']) => void;
    onChangeRightAmount: (value: AddLiquidityFormStoreData['rightAmount']) => void;
    onSelectLeftToken: (root: string) => void;
    onSelectRightToken: (root: string) => void;
    onDismissTransactionReceipt: () => void;
    onLeftImportConfirm: (leftRoot: string, rightRoot?: string) => void;
    onRightImportConfirm: (leftRoot: string, rightRoot: string) => void;
}


export function useAddLiquidityForm(): PoolFormShape {
    const formStore = useAddLiquidityFormStoreContext()
    const history = useHistory()

    const [isTokenListShown, setTokenListVisible] = React.useState(false)

    const [tokenSide, setTokenSide] = React.useState<TokenSide>()

    const hideTokensList = () => {
        setTokenSide(undefined)
        setTokenListVisible(false)
    }

    const showTokensList = (side: TokenSide) => () => {
        if (
            formStore.isCheckingDexAccount
            || formStore.isDepositingRight
            || formStore.isDepositingLeft
            || formStore.isDepositingLiquidity
            || formStore.isPreparing
            || formStore.isSyncingPool
        ) {
            return
        }

        setTokenSide(side)
        setTokenListVisible(true)
    }

    const resolveStateFromUrl = async (leftRoot?: string, rightRoot?: string) => {
        const isLeftRootValid = isAddressValid(leftRoot)
        const isRightRootValid = isAddressValid(rightRoot)

        if (!isLeftRootValid && !isRightRootValid) {
            return
        }

        formStore.setData({ leftToken: leftRoot, rightToken: rightRoot })

        if (formStore.tokensCache.isReady) {
            const leftInCache = formStore.tokensCache.has(leftRoot)
            const rightInCache = formStore.tokensCache.has(rightRoot)

            try {
                if (isLeftRootValid && !leftInCache) {
                    debug('Try to fetch left token')
                    await formStore.tokensCache.addToImportQueue(leftRoot)
                }
            }
            catch (e) {
                error('Left token import error', e)
                formStore.setData('leftToken', undefined)
            }

            try {
                if (isRightRootValid && !rightInCache) {
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

    const onChangeLeftAmount: PoolFormShape['onChangeLeftAmount'] = async value => {
        await formStore.changeLeftAmount(value)
    }

    const onChangeRightAmount: PoolFormShape['onChangeRightAmount'] = async value => {
        await formStore.changeRightAmount(value)
    }

    const onSelectLeftToken: PoolFormShape['onSelectLeftToken'] = async root => {
        hideTokensList()

        const rightRoot = (formStore.rightToken?.root !== undefined && formStore.rightToken.root !== root)
            ? formStore.rightToken.root
            : undefined

        history.replace(appRoutes.liquidityAdd.makeUrl({
            leftTokenRoot: root,
            rightTokenRoot: rightRoot,
        }))

        await formStore.changeLeftToken(root)
    }

    const onSelectRightToken: PoolFormShape['onSelectRightToken'] = async root => {
        hideTokensList()

        if (formStore.leftToken?.root !== undefined) {
            history.replace(appRoutes.liquidityAdd.makeUrl({
                leftTokenRoot: formStore.leftToken.root,
                rightTokenRoot: root,
            }))
        }

        await formStore.changeRightToken(root)
    }

    const onDismissTransactionReceipt = () => {
        //
    }

    const onLeftImportConfirm: PoolFormShape['onLeftImportConfirm'] = async (leftRoot: string, rightRoot?: string) => {
        await onSelectLeftToken(leftRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    const onRightImportConfirm: PoolFormShape['onRightImportConfirm'] = async (leftRoot: string, rightRoot: string) => {
        await onSelectRightToken(rightRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    return {
        hideTokensList,
        isTokenListShown,
        resolveStateFromUrl,
        showTokensList,
        tokenSide,
        // eslint-disable-next-line sort-keys
        onChangeLeftAmount,
        onChangeRightAmount,
        onDismissTransactionReceipt,
        onLeftImportConfirm,
        onRightImportConfirm,
        onSelectLeftToken,
        onSelectRightToken,
    }
}

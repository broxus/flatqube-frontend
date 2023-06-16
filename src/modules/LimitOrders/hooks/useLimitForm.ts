import * as React from 'react'
import { useHistory } from 'react-router-dom'

import type { TokenSide } from '@/modules/TokensList'
import { appRoutes } from '@/routes'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { isAddressValid } from '@/misc'
import { debug, error } from '@/utils'


type LimitFormShape = {
    isTokenListShown: boolean;
    tokenSide: TokenSide | undefined;
    hideTokensList: () => void;
    resolveStateFromUrl: (leftRoot?: string, rightRoot?: string) => Promise<void>;
    toggleSwapDirection: () => void;
    showTokensList: (side: TokenSide) => () => void;
    onSelectLeftToken: (root: string) => void;
    onSelectRightToken: (root: string) => void;
    onLeftImportConfirm: (leftRoot: string, rightRoot?: string) => void;
    onRightImportConfirm: (leftRoot: string, rightRoot: string) => void;
}


export function useLimitForm(): LimitFormShape {
    const p2pFormStore = useP2PFormStoreContext()
    const history = useHistory()

    const [isTokenListShown, setTokenListVisible] = React.useState(false)

    const [tokenSide, setTokenSide] = React.useState<TokenSide>()

    const hideTokensList: LimitFormShape['hideTokensList'] = () => {
        setTokenSide(undefined)
        setTokenListVisible(false)
    }

    const showTokensList = (side: TokenSide) => () => {
        if (p2pFormStore.isProcessing) {
            return
        }
        setTokenSide(side)
        setTokenListVisible(true)
    }

    const resolveStateFromUrl: LimitFormShape['resolveStateFromUrl'] = async (leftRoot?: string, rightRoot?: string) => {
        const isLeftRootAvailable = isAddressValid(p2pFormStore.leftToken?.root)
        const isRightRootAvailable = isAddressValid(p2pFormStore.rightToken?.root)
        const isLeftRootValid = isAddressValid(leftRoot)
        const isRightRootValid = isAddressValid(rightRoot)

        if (isLeftRootAvailable && isRightRootAvailable && !isLeftRootValid && !isRightRootValid) {
            return
        }

        if (isLeftRootValid && isRightRootValid) {
            p2pFormStore.setData({
                leftToken: leftRoot,
                rightToken: rightRoot,
            })
        }
        else if (isLeftRootValid && !isRightRootValid) {
            p2pFormStore.setData({
                leftToken: leftRoot ?? p2pFormStore.leftToken?.root,
                rightToken: undefined,
            })
        }

        if (p2pFormStore.tokensCache.isReady) {
            const leftInCache = p2pFormStore.tokensCache.has(leftRoot)
            const rightInCache = p2pFormStore.tokensCache.has(rightRoot)

            try {
                if (isLeftRootValid && !leftInCache) {
                    debug('Try to fetch left token')
                    await p2pFormStore.tokensCache.addToImportQueue(leftRoot)
                }
            }
            catch (e) {
                error('Left token import error', e)
                p2pFormStore.setData('leftToken', undefined)
            }

            try {
                if (isRightRootValid && !rightInCache) {
                    debug('Try to fetch right token')
                    await p2pFormStore.tokensCache.addToImportQueue(rightRoot)
                }
            }
            catch (e) {
                error('Right token import error', e)
                p2pFormStore.setData('rightToken', undefined)
            }
        }
    }
    const onSelectLeftToken: LimitFormShape['onSelectLeftToken'] = async root => {
        hideTokensList()


        const isReverting = root === p2pFormStore.rightToken?.root
        debug('isReverting', isReverting, {
            leftTokenRoot: root,
            rightTokenRoot: !isReverting
                ? p2pFormStore.leftToken?.root ?? ''
                : p2pFormStore.rightToken?.root ?? '',
        })
        history.replace(appRoutes.limit.makeUrl({
            leftTokenRoot: root,
            rightTokenRoot: isReverting
                ? p2pFormStore.leftToken?.root ?? ''
                : p2pFormStore.rightToken?.root ?? '',
        }))
        p2pFormStore.setData({
            leftToken: root,
            rightToken: isReverting
                ? p2pFormStore.leftToken?.root
                : p2pFormStore.rightToken?.root,
        })
    }

    const onSelectRightToken: LimitFormShape['onSelectRightToken'] = async root => {
        hideTokensList()

        if (!root) return

        // p2pStore.setData({
        //     rightToken: root,
        // })

        if (!p2pFormStore.leftToken?.root) return
        const isReverting = root === p2pFormStore.leftToken?.root
        // history.replace(appRoutes.limit.makeUrl({
        //     leftTokenRoot: root,
        //     rightTokenRoot: isReverting
        //         ? p2pStore.leftToken?.root ?? ''
        //         : p2pStore.rightToken?.root ?? '',
        // }))
        history.replace(appRoutes.limit.makeUrl({
            leftTokenRoot: isReverting
                ? p2pFormStore.rightToken?.root
                : p2pFormStore.leftToken?.root,
            rightTokenRoot: root,
        }))
        p2pFormStore.setData({
            leftToken: isReverting
                ? p2pFormStore.rightToken?.root
                : p2pFormStore.leftToken?.root,
            rightToken: root,
        })
    }

    const onLeftImportConfirm: LimitFormShape['onLeftImportConfirm'] = async (leftRoot: string, rightRoot?: string) => {
        await onSelectLeftToken(leftRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    const onRightImportConfirm: LimitFormShape['onRightImportConfirm'] = async (leftRoot: string, rightRoot: string) => {
        await onSelectRightToken(rightRoot)
        await resolveStateFromUrl(leftRoot, rightRoot)
        hideTokensList()
    }

    const toggleSwapDirection = async (): Promise<void> => {
        if (p2pFormStore.isProcessing) {
            return
        }

        await p2pFormStore.toggleDirection()

        history.replace(appRoutes.limit.makeUrl({
            leftTokenRoot: p2pFormStore.leftToken?.root ?? '',
            rightTokenRoot: p2pFormStore.leftToken?.root ? p2pFormStore.rightToken?.root ?? '' : '',
        }))
    }

    return {
        hideTokensList,
        isTokenListShown,
        resolveStateFromUrl,
        showTokensList,
        toggleSwapDirection,
        tokenSide,
        // eslint-disable-next-line sort-keys
        onLeftImportConfirm,
        onRightImportConfirm,
        onSelectLeftToken,
        onSelectRightToken,
    }
}

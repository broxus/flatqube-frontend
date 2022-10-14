import * as React from 'react'
import { reaction } from 'mobx'
import { useHistory, useParams } from 'react-router-dom'

import { isAddressValid } from '@/misc'
import { usePoolStore } from '@/modules/Pool/stores/PoolStore'
import { PoolStoreData } from '@/modules/Pool/types'
import { TokenSide } from '@/modules/TokensList'
import { useTokensCache } from '@/stores/TokensCacheService'
import { debounce, debug, error } from '@/utils'


type PoolFormShape = {
    isTokenListShown: boolean;
    tokenSide: TokenSide | undefined;
    debouncedSyncPoolShare: () => void;
    hideTokensList: () => void;
    showTokensList: (side: TokenSide) => () => void;
    onChangeData: <K extends keyof PoolStoreData>(key: K) => (value: PoolStoreData[K]) => void;
    onSelectLeftToken: (root: string) => void;
    onSelectRightToken: (root: string) => void;
    onDismissTransactionReceipt: () => void;
    onLeftImportConfirm: (root: string) => void;
    onRightImportConfirm: (root: string) => void;
}


export function usePoolForm(): PoolFormShape {
    const pool = usePoolStore()
    const {
        leftTokenRoot,
        rightTokenRoot,
    } = useParams<{
        leftTokenRoot: string,
        rightTokenRoot: string,
    }>()
    const history = useHistory()
    const tokensCache = useTokensCache()

    const [isTokenListShown, setTokenListVisible] = React.useState(false)

    const [tokenSide, setTokenSide] = React.useState<TokenSide>()

    const debouncedSyncPoolShare = debounce(async () => {
        await pool.fetchPoolShare()
    }, 500)

    const hideTokensList = () => {
        setTokenSide(undefined)
        setTokenListVisible(false)
    }

    const showTokensList = (side: TokenSide) => () => {
        if (
            pool.isDepositingRight
            || pool.isDepositingLeft
            || pool.isDepositingLiquidity
            || pool.isSyncPairBalances
            || pool.isSyncPairRoots
        ) {
            return
        }

        setTokenSide(side)
        setTokenListVisible(true)
    }

    const resolveStateFromUrl = async (leftRoot: string, rightRoot: string) => {
        const isLeftRootValid = isAddressValid(leftRoot)
        const isRightRootValid = isAddressValid(rightRoot)

        if (!isLeftRootValid && !isRightRootValid) {
            return
        }

        pool.setData({ leftToken: leftRoot, rightToken: rightRoot })

        if (tokensCache.isReady) {
            const leftInCache = tokensCache.has(leftRoot)
            const rightInCache = tokensCache.has(rightRoot)

            try {
                if (isLeftRootValid && !leftInCache) {
                    debug('Try to fetch left token')
                    await tokensCache.addToImportQueue(leftRoot)
                }
            }
            catch (e) {
                error('Left token import error', e)
                pool.setData('leftToken', undefined)
            }

            try {
                if (isRightRootValid && !rightInCache) {
                    debug('Try to fetch right token')
                    await tokensCache.addToImportQueue(rightRoot)
                }
            }
            catch (e) {
                error('Right token import error', e)
                pool.setData('rightToken', undefined)
            }
        }
    }

    const onChangeData: PoolFormShape['onChangeData'] = key => value => {
        if (['leftAmount', 'rightAmount'].includes(key)) {
            pool.changeAmount(key, value)
        }
        else {
            pool.setData(key, value)
        }
    }

    const onSelectLeftToken: PoolFormShape['onSelectLeftToken'] = root => {
        hideTokensList()
        pool.setData('leftToken', root)
        const rightRoot = (pool.rightToken?.root !== undefined && pool.rightToken.root !== root)
            ? `/${pool.rightToken.root}`
            : ''
        history.replace(`/pool/${root}${rightRoot}`)
    }

    const onSelectRightToken: PoolFormShape['onSelectRightToken'] = root => {
        hideTokensList()
        pool.setData('rightToken', root)
        if (pool.leftToken?.root !== undefined) {
            history.replace(`/pool/${pool.leftToken.root}/${root}`)
        }
    }

    const onDismissTransactionReceipt = () => {
        pool.cleanDepositLiquidityResult()
    }

    const onLeftImportConfirm: PoolFormShape['onLeftImportConfirm'] = async root => {
        await onSelectLeftToken(root)
        await resolveStateFromUrl(root, rightTokenRoot)
        hideTokensList()
    }

    const onRightImportConfirm: PoolFormShape['onRightImportConfirm'] = async root => {
        await onSelectRightToken(root)
        await resolveStateFromUrl(leftTokenRoot, root)
        hideTokensList()
    }

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => tokensCache.isReady,
            async isReady => {
                pool.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await resolveStateFromUrl(leftTokenRoot, rightTokenRoot)
                        await pool.init()
                    }
                    catch (e) {}
                    finally {
                        pool.setState('isPreparing', false)
                    }
                }
            },
            { delay: 50, fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            pool.dispose().catch(reason => error(reason))
        }
    }, [])

    return {
        debouncedSyncPoolShare,
        hideTokensList,
        isTokenListShown,
        showTokensList,
        tokenSide,
        // eslint-disable-next-line sort-keys
        onChangeData,
        onDismissTransactionReceipt,
        onLeftImportConfirm,
        onRightImportConfirm,
        onSelectLeftToken,
        onSelectRightToken,
    }
}

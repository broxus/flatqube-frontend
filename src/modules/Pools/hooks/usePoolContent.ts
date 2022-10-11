import * as React from 'react'
import { useParams } from 'react-router-dom'
import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { PairResponse } from '@/modules/Pairs/types'
import { FarmingPoolsItemResponse, RewardTokenRootInfo } from '@/modules/Farming/types'
import { useWallet } from '@/stores/WalletService'
import { TokenCache, useTokensCache } from '@/stores/TokensCacheService'
import { useApi } from '@/modules/Pools/hooks/useApi'
import {
    error,
    formattedTokenAmount,
    getPrice,
    shareAmount,
} from '@/utils'
import {
    Farm,
    Pool,
    PoolData,
    UserPendingReward,
} from '@/misc'

type RewardInfo = {
    vested: string;
    entitled: string;
    symbol: string;
}

type FarmingBalanceInfo = {
    reward: RewardInfo[];
}

type FarmInfo = {
    info: FarmingPoolsItemResponse;
    balance: FarmingBalanceInfo;
}

export type PoolContent = {
    priceLeftToRight?: string;
    priceRightToLeft?: string;
    lockedLp?: string;
    lockedLeft?: string;
    lockedRight?: string;
    walletLeft?: string;
    walletRight?: string;
    totalLp?: string;
    totalLeft?: string;
    totalRight?: string;
    pool?: PoolData;
    pairAddress?: string;
    ownerAddress?: string;
    leftToken?: TokenCache;
    rightToken?: TokenCache;
    totalShare?: string;
    farmingLoading?: boolean;
    notFounded?: boolean;
    farming?: FarmInfo[];
}

type Params = {
    address: string;
}

export function usePoolContent(): PoolContent {
    const api = useApi()
    const params = useParams<Params>()
    const wallet = useWallet()
    const tokensCache = useTokensCache()
    const [pool, setPool] = React.useState<PoolData | undefined>()
    const [pair, setPair] = React.useState<PairResponse | undefined>()
    const [farming, setFarming] = React.useState<FarmInfo[]>([])
    const [farmingLoading, setFarmingLoading] = React.useState(true)
    const [notFounded, setNotFounded] = React.useState(false)

    if (!wallet.address) {
        return {}
    }

    const leftToken = React.useMemo(() => (
        pool && tokensCache.get(pool.left.address)
    ), [pool])

    const rightToken = React.useMemo(() => (
        pool && tokensCache.get(pool.right.address)
    ), [pool])

    const priceLeftToRight = React.useMemo(() => {
        const price = pair && pool && leftToken && rightToken && getPrice(
            pair.leftLocked,
            pair.rightLocked,
            leftToken.decimals,
            rightToken.decimals,
        )
        if (pair?.meta.pairType === 'stable') {
            return pair.oneLeftToRight ?? price
        }
        return price
    }, [pair, pool])

    const priceRightToLeft = React.useMemo(() => {
        const price = pair && pool && leftToken && rightToken && getPrice(
            pair.rightLocked,
            pair.leftLocked,
            rightToken.decimals,
            leftToken.decimals,
        )
        if (pair?.meta.pairType === 'stable') {
            return pair.oneRightToLeft ?? price
        }
        return price
    }, [pair, pool])

    const lockedLp = React.useMemo(() => (
        pool && farming.reduce((acc, item) => (
            acc.plus(item.info.user_token_balance)
        ), new BigNumber(0)).shiftedBy(pool.lp.decimals).toFixed()
    ), [pool, farming])

    const lockedLeft = React.useMemo(() => (
        pool && lockedLp && shareAmount(
            lockedLp,
            pool.left.inPool,
            pool.lp.inPool,
            leftToken?.decimals ?? 0,
        )
    ), [pool, lockedLp, leftToken])

    const lockedRight = React.useMemo(() => (
        pool && lockedLp && shareAmount(
            lockedLp,
            pool.right.inPool,
            pool.lp.inPool,
            rightToken?.decimals ?? 0,
        )
    ), [pool, lockedLp, rightToken])

    const walletLeft = React.useMemo(() => (
        pool && leftToken && shareAmount(
            pool.lp.inWallet,
            pool.left.inPool,
            pool.lp.inPool,
            leftToken.decimals,
        )
    ), [pool, leftToken])

    const walletRight = React.useMemo(() => (
        pool && rightToken && shareAmount(
            pool.lp.inWallet,
            pool.right.inPool,
            pool.lp.inPool,
            rightToken.decimals,
        )
    ), [pool, rightToken])

    const totalLp = React.useMemo(() => (
        pool && lockedLp && new BigNumber(lockedLp)
            .plus(pool.lp.inWallet)
            .toFixed()
    ), [pool, lockedLp])

    const totalLeft = React.useMemo(() => (
        walletLeft && lockedLeft && new BigNumber(walletLeft)
            .plus(lockedLeft)
            .toFixed()
    ), [walletLeft, lockedLeft])

    const totalRight = React.useMemo(() => (
        walletRight && lockedRight && new BigNumber(walletRight)
            .plus(lockedRight)
            .toFixed()
    ), [walletRight, lockedRight])

    const totalShare = React.useMemo(() => (
        pool && totalLp
            ? new BigNumber(totalLp)
                .multipliedBy(100)
                .div(pool.lp.inPool)
                .decimalPlaces(8, BigNumber.ROUND_DOWN)
                .toFixed()
            : undefined
    ), [pool, totalLp])

    const getFarmingPools = async (
        root: Address,
        owner: Address,
        limit: number = 100,
    ): Promise<FarmingPoolsItemResponse[]> => {
        const { total_count, pools_info } = await api.farmingPools({}, {
            body: JSON.stringify({
                limit,
                offset: 0,
                userAddress: owner.toString(),
                rootAddresses: [root.toString()],
                ordering: 'tvlascending',
                isLowBalance: false,
            }),
        })
        let poolsInfo = pools_info.filter(item => (
            item.left_address
            && item.left_currency
            && item.right_address
            && item.right_currency
        ))
        if (total_count > 100) {
            poolsInfo = await getFarmingPools(root, owner, total_count)
        }
        return poolsInfo
    }

    const getFarmReward = async (
        poolAddress: Address,
        userDataAddress: Address,
        rewardTokenInfo: RewardTokenRootInfo[],
        farmEnd?: number,
    ): Promise<RewardInfo[]> => {
        const poolRewardData = await Farm.poolCalculateRewardData(poolAddress)
        let userReward: UserPendingReward | undefined
        try {
            userReward = await Farm.userPendingReward(
                userDataAddress,
                poolRewardData._accRewardPerShare,
                poolRewardData._lastRewardTime,
                `${farmEnd ? farmEnd / 1000 : 0}`,
            )
        }
        catch (e) {
            error(e)
        }
        return rewardTokenInfo.map(({ reward_currency, reward_scale }, index) => {
            const poolDebt = userReward ? userReward._pool_debt[index] : '0'
            const vested = userReward ? userReward._vested[index] : '0'
            const entitled = userReward ? userReward._entitled[index] : '0'
            const totalVested = new BigNumber(vested).plus(poolDebt)

            return {
                vested: formattedTokenAmount(totalVested.toFixed(), reward_scale),
                entitled: formattedTokenAmount(entitled, reward_scale),
                symbol: reward_currency,
            }
        })
    }

    const getFarmBalance = async (
        poolAddress: Address,
        walletAddress: Address,
        rewardTokenInfo: RewardTokenRootInfo[],
        farmEndTime?: number,
    ): Promise<FarmingBalanceInfo> => {
        const userDataAddress = await Farm.userDataAddress(poolAddress, walletAddress)
        const reward = await getFarmReward(
            poolAddress,
            userDataAddress,
            rewardTokenInfo,
            farmEndTime,
        )
        return {
            reward,
        }
    }

    const getFarmData = async (
        root: Address,
        owner: Address,
    ): Promise<FarmInfo[]> => {
        const pools = await getFarmingPools(root, owner)
        const balances = await Promise.all(
            pools.map(item => (
                getFarmBalance(
                    new Address(item.pool_address),
                    owner,
                    item.reward_token_root_info,
                    item.farm_end_time,
                )
            )),
        )
        return pools.map((item, index) => ({
            info: item,
            balance: balances[index],
        }))
    }

    const syncPoolData = async () => {
        if (wallet.address) {
            try {
                const poolData = await Pool.pool(
                    new Address(params.address),
                    new Address(wallet.address),
                )
                tokensCache.syncCustomToken(poolData.left.address)
                tokensCache.syncCustomToken(poolData.right.address)
                setPool(poolData)
            }
            catch (e) {
                error(e)
            }
        }
        else {
            setPool(undefined)
        }
    }

    const syncPairData = async () => {
        try {
            const pairData = await api.pair({
                address: params.address,
            })
            setPair(pairData)
        }
        catch (e) {
            setNotFounded(true)
            error(e)
        }
    }

    const syncFarmData = async () => {
        if (pool && wallet.address) {
            setFarmingLoading(true)
            try {
                setFarming(await getFarmData(
                    new Address(pool.lp.address),
                    new Address(wallet.address),
                ))
            }
            catch (e) {
                error(e)
            }
            finally {
                setFarmingLoading(false)
            }
        }
        else {
            setFarming([])
        }
    }

    React.useEffect(() => {
        syncPoolData()
    }, [params.address, wallet.address])

    React.useEffect(() => {
        syncPairData()
    }, [params.address])

    React.useEffect(() => {
        syncFarmData()
    }, [pool])

    return {
        farming,
        farmingLoading,
        priceLeftToRight,
        priceRightToLeft,
        lockedLp,
        lockedLeft,
        lockedRight,
        walletLeft,
        walletRight,
        totalLp,
        totalLeft,
        totalRight,
        pool,
        leftToken,
        rightToken,
        totalShare,
        notFounded,
        pairAddress: params.address,
        ownerAddress: wallet.address,
    }
}

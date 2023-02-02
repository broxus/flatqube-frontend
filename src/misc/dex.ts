import {
    Address,
    FullContractState,
    TransactionId,
} from 'everscale-inpage-provider'

import { DexRootAddress } from '@/config'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { DexAbi } from '@/misc/abi'
import { TokenWallet } from '@/misc/token-wallet'

export enum PairType {
    CONSTANT_PRODUCT = '1',
    STABLESWAP = '2',
}

export type PairTokenRoots = {
    left: Address;
    right: Address;
    lp: Address;
}

export type PairTokenRootsSymbols = {
    leftSymbol: string;
    rightSymbol: string;
    lpSymbol: string;
}

export type PairBalances = {
    left: string;
    right: string;
    lp: string;
}

export type PairExpectedDepositLiquidity = {
    step_1_left_deposit: string | number;
    step_1_right_deposit: string | number;
    step_1_lp_reward: string | number;
    step_2_left_to_right: boolean;
    step_2_right_to_left: boolean;
    step_2_spent: string | number;
    step_2_fee: string | number;
    step_2_received: string | number;
    step_3_left_deposit: string | number;
    step_3_right_deposit: string | number;
    step_3_lp_reward: string | number;
}

export type StablePairExpectedDepositLiquidity = {
    old_balances: string[];
    amounts: string[];
    lp_reward: string;
    result_balances: string[];
    invariant: string;
    differences: string[];
    sell: boolean[];
    pool_fees: string[];
    beneficiary_fees: string[];
}


const rpc = useRpc()
const staticRpc = useStaticRpc()


export class Dex {

    public static async accountAddress(
        owner: Address,
        state?: FullContractState,
    ): Promise<Address> {
        const rootContract = new staticRpc.Contract(DexAbi.Root, DexRootAddress)
        return (await rootContract.methods.getExpectedAccountAddress({
            account_owner: owner,
            answerId: 0,
        }).call({ cachedState: state })).value0
    }

    public static async accountWallets(
        account: Address,
        state?: FullContractState,
    ): Promise<Map<string, Address>> {
        const accountContract = new staticRpc.Contract(DexAbi.Account, account)
        const {
            value0: wallets,
        } = await accountContract.methods.getWallets({}).call({
            cachedState: state,
        })
        const map = new Map<string, Address>()
        wallets.forEach(w => {
            map.set(w[0].toString(), w[1])
        })
        return map
    }

    public static async accountBalance(
        account: Address,
        root: Address,
        state?: FullContractState,
    ): Promise<string> {
        const accountContract = new staticRpc.Contract(DexAbi.Account, account)
        const { balance } = await accountContract.methods.getWalletData({
            answerId: 0,
            token_root: root,
        }).call({ cachedState: state })
        return balance.toString()
    }

    public static async accountBalances(
        account: Address,
        state?: FullContractState,
    ): Promise<Map<string, string>> {
        const accountContract = new staticRpc.Contract(DexAbi.Account, account)
        const {
            value0: balances,
        } = await accountContract.methods.getBalances({}).call({
            cachedState: state,
        })
        const balancesMap = new Map<string, string>()
        balances.forEach(([address, balance]) => {
            balancesMap.set(address.toString(), balance.toString())
        })
        return balancesMap
    }

    public static async accountVersion(
        account: Address,
        state?: FullContractState,
    ): Promise<string> {
        const accountContract = new staticRpc.Contract(DexAbi.Account, account)
        const {
            value0: version,
        } = await accountContract.methods.getVersion({
            answerId: 0,
        }).call({ cachedState: state })
        return version.toString()
    }

    public static async pairAddress(
        left: Address,
        right: Address,
        state?: FullContractState,
    ): Promise<Address> {
        const rootContract = new staticRpc.Contract(DexAbi.Root, DexRootAddress)
        const {
            value0: pairAddress,
        } = await rootContract.methods.getExpectedPairAddress({
            answerId: 0,
            left_root: left,
            right_root: right,
        }).call({ cachedState: state })
        return pairAddress
    }

    public static async pairIsActive(
        pair: Address,
        state?: FullContractState,
    ): Promise<boolean> {
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pair)
        const {
            value0: isActive,
        } = await pairContract.methods.isActive({
            answerId: 0,
        }).call({ cachedState: state })
        return isActive
    }

    public static async pairLpRoot(
        pair: Address,
        state?: FullContractState,
    ): Promise<Address> {
        return (await Dex.pairTokenRoots(pair, state)).lp
    }

    public static async pairType(
        pair: Address,
        state?: FullContractState,
    ): Promise<string> {
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pair)
        return (await pairContract.methods.getPoolType({
            answerId: 0,
        }).call({ cachedState: state })).value0.toString()
    }

    public static async pairTokenRoots(
        pair: Address,
        state?: FullContractState,
    ): Promise<PairTokenRoots> {
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pair)
        const {
            left,
            right,
            lp,
        } = await pairContract.methods.getTokenRoots({
            answerId: 0,
        }).call({ cachedState: state })
        return { left, lp, right }
    }

    public static async pairTokenRootsSymbols(
        pair: Address,
        state?: FullContractState,
    ): Promise<PairTokenRootsSymbols> {
        const { left, right, lp } = await Dex.pairTokenRoots(pair, state)
        const [leftSymbol, rightSymbol, lpSymbol] = await Promise.all([
            TokenWallet.getSymbol(left),
            TokenWallet.getSymbol(right),
            TokenWallet.getSymbol(lp),
        ])
        return { leftSymbol, lpSymbol, rightSymbol }
    }

    public static async pairBalances(
        pair: Address,
        state?: FullContractState,
    ): Promise<PairBalances> {
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pair)
        const {
            value0: {
                left_balance: left,
                right_balance: right,
                lp_supply: lp,
            },
        } = await pairContract.methods.getBalances({
            answerId: 0,
        }).call({ cachedState: state })
        return {
            left: left.toString(),
            lp: lp.toString(),
            right: right.toString(),
        }
    }

    public static async pairExpectedDepositLiquidity(
        pair: Address,
        autoChange: boolean,
        leftAmount: string,
        rightAmount: string,
        state?: FullContractState,
    ): Promise<PairExpectedDepositLiquidity> {
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pair)
        const { value0: result } = await pairContract.methods.expectedDepositLiquidity({
            answerId: 0,
            auto_change: autoChange,
            left_amount: leftAmount,
            right_amount: rightAmount,
        }).call({ cachedState: state })
        return result
    }

    public static async pairExpectedDepositLiquidityV2(
        pair: Address,
        leftAmount: string,
        rightAmount: string,
        state?: FullContractState,
    ): Promise<StablePairExpectedDepositLiquidity> {
        const pairContract = new staticRpc.Contract(DexAbi.StablePair, pair)
        const { value0: result } = await pairContract.methods.expectedDepositLiquidityV2({
            amounts: [leftAmount, rightAmount],
            answerId: 0,
        }).call({ cachedState: state })
        return result
    }

    public static async createAccount(owner: Address): Promise<TransactionId> {
        const rootContract = new rpc.Contract(DexAbi.Root, DexRootAddress)
        const { id } = await rootContract.methods.deployAccount({
            account_owner: owner,
            send_gas_to: owner,
        }).send({
            amount: '2000000000',
            bounce: false,
            from: owner,
        })
        return id
    }

    public static async createPair(
        left: Address,
        right: Address,
        creator: Address,
    ): Promise<TransactionId> {
        const rootContract = new rpc.Contract(DexAbi.Root, DexRootAddress)
        return (await rootContract.methods.deployPair({
            left_root: left,
            right_root: right,
            send_gas_to: creator,
        }).send({
            amount: '10000000000',
            bounce: true,
            from: creator,
        })).id
    }

    public static async connectPair(
        account: Address,
        left: Address,
        right: Address,
        creator: Address,
    ): Promise<TransactionId> {
        const accountContract = new rpc.Contract(DexAbi.Account, account)
        return (await accountContract.methods.addPair({
            left_root: left,
            right_root: right,
        }).send({
            amount: '3000000000',
            bounce: false,
            from: creator,
        })).id
    }

    public static async withdrawAccountTokens(
        account: Address,
        root: Address,
        owner: Address,
        amount: string,
        callId: string,
    ): Promise<TransactionId> {
        const accountContract = new rpc.Contract(DexAbi.Account, account)
        const { id } = await accountContract.methods.withdraw({
            amount,
            call_id: callId,
            deploy_wallet_grams: '100000000',
            recipient_address: owner,
            send_gas_to: owner,
            token_root: root,
            // recipient_public_key: '0',
        }).send({
            amount: '2100000000',
            bounce: false,
            from: owner,
        })
        return id
    }

    public static async withdrawAccountLiquidity(
        account: Address,
        owner: Address,
        leftRoot: Address,
        rightRoot: Address,
        lpRoot: Address,
        amount: string,
        callId: string,
    ): Promise<TransactionId> {
        const accountContract = new rpc.Contract(DexAbi.Account, account)
        const { id } = await accountContract.methods.withdrawLiquidity({
            call_id: callId,
            left_root: leftRoot,
            lp_amount: amount,
            lp_root: lpRoot,
            right_root: rightRoot,
            send_gas_to: owner,
        }).send({
            amount: '2700000000',
            bounce: false,
            from: owner,
        })
        return id
    }

    public static async withdrawLiquidity(
        owner: Address,
        leftRoot: Address,
        rightRoot: Address,
        lpRoot: Address,
        amount: string,
        payloadId?: string,
    ): Promise<TransactionId> {
        const pairAddress = await Dex.pairAddress(leftRoot, rightRoot)
        const lpWalletPair = await TokenWallet.walletAddress({ owner: pairAddress, root: lpRoot })
        const lpWalletUser = await TokenWallet.walletAddress({ owner, root: lpRoot })
        const lpWalletPairState = (
            await staticRpc.getFullContractState({ address: lpWalletPair })
        ).state
        const lpWalletUserState = (
            await staticRpc.getFullContractState({ address: lpWalletUser })
        ).state
        if (
            lpWalletPairState === undefined
            || lpWalletUserState === undefined
            || !lpWalletPairState.isDeployed
            || !lpWalletUserState.isDeployed
        ) {
            throw Error('LP wallets not exists')
        }
        const leftWalletUser = await TokenWallet.walletAddress({ owner, root: leftRoot })
        const rightWalletUser = await TokenWallet.walletAddress({ owner, root: rightRoot })
        const leftWalletUserState = (
            await staticRpc.getFullContractState({ address: leftWalletUser })
        ).state
        const rightWalletUserState = (
            await staticRpc.getFullContractState({ address: rightWalletUser })
        ).state
        const allDeployed = leftWalletUserState !== undefined
            && rightWalletUserState !== undefined
            && leftWalletUserState.isDeployed
            && rightWalletUserState.isDeployed
        const pairContract = new staticRpc.Contract(DexAbi.Pair, pairAddress)
        const { value0: withdrawPayload } = await pairContract.methods.buildWithdrawLiquidityPayload({
            deploy_wallet_grams: allDeployed ? '0' : '100000000',
            id: payloadId || new Date().getTime().toString(),
        }).call()
        return TokenWallet.send({
            address: lpWalletUser,
            bounce: true,
            grams: '2700000000',
            owner,
            payload: withdrawPayload,
            recipient: lpWalletPair,
            tokens: amount,
            withDerive: false,
        })
    }

    public static async depositAccountLiquidity(
        account: Address,
        owner: Address,
        leftRoot: Address,
        rightRoot: Address,
        lpRoot: Address,
        leftAmount: string,
        rightAmount: string,
        autoChange: boolean,
        callId: string,
    ): Promise<TransactionId> {
        const accountContract = new rpc.Contract(DexAbi.Account, account)
        const { id } = await accountContract.methods.depositLiquidity({
            auto_change: autoChange,
            call_id: callId,
            expected_lp_root: lpRoot,
            left_amount: leftAmount,
            left_root: leftRoot,
            right_amount: rightAmount,
            right_root: rightRoot,
            send_gas_to: owner,
        }).send({
            amount: '2600000000',
            bounce: false,
            from: owner,
        })
        return id
    }

}

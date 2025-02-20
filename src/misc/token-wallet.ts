import {
    Address, DelayedMessageExecution,
    FullContractState,
    TransactionId,
} from 'everscale-inpage-provider'

import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { TokenAbi } from '@/misc/abi'
import { debug, error, sliceAddress } from '@/utils'
import { SupportedInterfaceDetection } from '@/misc/supported-interface-detection'


export type Token = {
    balance?: string;
    decimals: number;
    icon?: string;
    name?: string;
    root: string;
    rootOwnerAddress?: Address;
    symbol: string;
    totalSupply?: string;
    updatedAt?: number;
    vendor?: string | null;
    verified?: boolean;
    wallet?: string;
}

export type BalanceWalletRequest = {
    wallet: Address;
}

export type WalletAddressRequest = {
    root: Address;
    owner: Address;
}

export type TokenDetailsResponse = {
    rootOwnerAddress: Address;
    totalSupply: string;
}

function params<TRequired>(): <TOptional>(o: TOptional) => Partial<TOptional> & TRequired;
function params<TOptional>(o: TOptional): Partial<TOptional>;
function params<T>(o?: T): Partial<T> | (<TOptional>(o: TOptional) => Partial<TOptional> & T) {
    if (o != null) {
        return o
    }
    return ((oo: any) => oo) as any
}


const staticRpc = useStaticRpc()


/**
 * @deprecated Use TokenUtils and TokenWalletUtils instead
 * @param args
 */
export class TokenWallet {

    public static async walletAddress(args: WalletAddressRequest, state?: FullContractState): Promise<Address> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, args.root)
        const tokenWallet = (await rootContract.methods.walletOf({
            answerId: 0,
            walletOwner: args.owner,
        }).call({ cachedState: state })).value0

        debug(
            `%cToken Wallet%c Request wallet address in token %c${sliceAddress(args.root.toString())}%c by owner %c${sliceAddress(args.owner.toString())}%c -> %c${sliceAddress(tokenWallet.toString())}`,
            'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
            'color: #c5e4f3',
            'color: #bae701',
            'color: #c5e4f3',
            'color: #bae701',
            'color: #c5e4f3',
            'color: #bae701',
        )

        return tokenWallet
    }

    public static async balance(
        args: BalanceWalletRequest | WalletAddressRequest,
        state?: FullContractState,
    ): Promise<string> {
        let { wallet } = (args as BalanceWalletRequest)

        if (wallet == null) {
            wallet = await this.walletAddress(args as WalletAddressRequest)
        }


        const tokenWalletContract = new staticRpc.Contract(TokenAbi.Wallet, wallet)
        const balance = (await tokenWalletContract.methods.balance({
            answerId: 0,
        }).call({ cachedState: state })).value0

        debug(
            `%cToken Wallet%c Request token wallet %c${sliceAddress(wallet.toString())}%c balance -> %c${balance}`,
            'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
            'color: #c5e4f3',
            'color: #bae701',
            'color: #c5e4f3',
            'color: #bae701',
        )

        return balance.toString()
    }

    public static async balanceByTokenRoot(ownerAddress: Address, tokenRootAddress: Address): Promise<string> {
        try {
            const walletAddress = await TokenWallet.walletAddress({
                owner: ownerAddress,
                root: tokenRootAddress,
            })
            return await TokenWallet.balance({
                wallet: walletAddress,
            })
        }
        catch (e) {
            return '0'
        }
    }

    public static async balanceByWalletAddress(walletAddress: Address): Promise<string> {
        try {
            return await TokenWallet.balance({
                wallet: walletAddress,
            })
        }
        catch (e) {
            return '0'
        }
    }

    public static async getDetails(root: Address, state?: FullContractState): Promise<TokenDetailsResponse> {
        const [rootOwnerAddress, totalSupply] = await Promise.all([
            TokenWallet.rootOwnerAddress(root, state),
            TokenWallet.totalSupply(root, state),
        ])

        return {
            rootOwnerAddress,
            totalSupply,
        }
    }

    public static async getTokenFullDetails(root: string): Promise<Token | undefined> {
        const address = new Address(root)

        let state: FullContractState | undefined

        try {
            const result = await staticRpc.getFullContractState({ address })
            state = result.state
        }
        catch (e) {
            error(e)
        }

        if (!await this.isNewTip3(root, state)) {
            return undefined
        }

        if (!state) {
            return undefined
        }

        if (state.isDeployed) {
            const [decimals, name, symbol, details] = await Promise.all([
                TokenWallet.getDecimals(address, state),
                TokenWallet.getName(address, state),
                TokenWallet.getSymbol(address, state),
                TokenWallet.getDetails(address, state),
            ])

            return {
                ...details,
                decimals,
                name,
                root,
                symbol,
            }
        }

        return undefined
    }

    public static async getDecimals(root: Address, state?: FullContractState): Promise<number> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, root)
        const response = (await rootContract.methods.decimals({ answerId: 0 }).call({
            cachedState: state,
            responsible: true,
        })).value0
        return parseInt(response, 10)
    }

    public static async getSymbol(root: Address, state?: FullContractState): Promise<string> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, root)
        return (await rootContract.methods.symbol({ answerId: 0 }).call({
            cachedState: state,
            responsible: true,
        })).value0
    }

    public static async getName(root: Address, state?: FullContractState): Promise<string> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, root)
        return (await rootContract.methods.name({ answerId: 0 }).call({
            cachedState: state,
            responsible: true,
        })).value0
    }

    public static async rootOwnerAddress(root: Address, state?: FullContractState): Promise<Address> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, root)
        return (await rootContract.methods.rootOwner({ answerId: 0 }).call({
            cachedState: state,
            responsible: true,
        })).value0
    }

    public static async totalSupply(root: Address, state?: FullContractState): Promise<string> {
        const rootContract = new staticRpc.Contract(TokenAbi.Root, root)
        return (await rootContract.methods.totalSupply({ answerId: 0 }).call({
            cachedState: state,
            responsible: true,
        })).value0
    }

    public static async isNewTip3(root: string, contractState?: FullContractState): Promise<boolean> {
        const address = new Address(root)

        let state = contractState

        if (!state) {
            const result = await staticRpc.getFullContractState({ address })
            state = result.state
        }

        if (!state || !state.isDeployed) {
            return false
        }

        return SupportedInterfaceDetection.supports({
            address,
            interfaces: [0x4371d8ed, 0x0b1fd263],
        }, state)
    }

    public static async send(args = params<{
        address: Address,
        recipient: Address,
        owner: Address,
        tokens: string,
    }>()({
        bounce: true,
        grams: '500000000',
        payload: '',
        withDerive: false,
    })): Promise<TransactionId> {
        let { address } = args

        if (args.withDerive) {
            address = await this.walletAddress({
                owner: args.owner,
                root: args.address,
            })
        }

        const rpc = useRpc()
        const tokenWalletContract = new rpc.Contract(TokenAbi.Wallet, address)

        const { id } = await tokenWalletContract.methods.transferToWallet({
            amount: args.tokens,
            notify: true,
            payload: args.payload || '',
            recipientTokenWallet: args.recipient,
            remainingGasTo: args.owner,
        }).send({
            amount: args.grams || '500000000',
            bounce: args.bounce,
            from: args.owner,
        })

        return id
    }

    public static async transfer(args = params<{
        address: Address,
        deployWalletValue: string,
        recipient: Address,
        owner: Address,
        tokens: string,
    }>()({
        bounce: true,
        grams: '500000000',
        payload: '',
        withDerive: false,
    })): Promise<DelayedMessageExecution> {
        let { address } = args

        if (args.withDerive) {
            address = await this.walletAddress({
                owner: args.owner,
                root: args.address,
            })
        }

        const rpc = useRpc()
        const tokenWalletContract = new rpc.Contract(TokenAbi.Wallet, address)

        return tokenWalletContract.methods.transfer({
            amount: args.tokens,
            deployWalletValue: args.deployWalletValue || '0',
            notify: true,
            payload: args.payload || '',
            recipient: args.recipient,
            remainingGasTo: args.owner,
        }).sendDelayed({
            amount: args.grams || '500000000',
            bounce: args.bounce,
            from: args.owner,
        })
    }

    public static async transferToWallet(args = params<{
        address: Address,
        recipient: Address,
        owner: Address,
        tokens: string,
    }>()({
        bounce: true,
        grams: '500000000',
        payload: '',
        withDerive: false,
    })): Promise<DelayedMessageExecution> {
        let { address } = args

        if (args.withDerive) {
            address = await this.walletAddress({
                owner: args.owner,
                root: args.address,
            })
        }

        const rpc = useRpc()
        const tokenWalletContract = new rpc.Contract(TokenAbi.Wallet, address)

        return tokenWalletContract.methods.transferToWallet({
            amount: args.tokens,
            notify: true,
            payload: args.payload || '',
            recipientTokenWallet: args.recipient,
            remainingGasTo: args.owner,
        }).sendDelayed({
            amount: args.grams || '500000000',
            bounce: args.bounce,
            from: args.owner,
        })
    }

}

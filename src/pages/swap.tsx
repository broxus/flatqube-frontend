import * as React from 'react'

import {
    EverToTip3Address,
    EverWeverToTip3Address,
    SafeAmount,
    Tip3ToEverAddress,
    USDTRootAddress,
    WEVERRootAddress,
    WeverVaultAddress,
    WrapGas,
} from '@/config'
import { Swap } from '@/modules/Swap'
import { SwapFormStoreProvider } from '@/modules/Swap/context'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'


export default function Page(): JSX.Element {
    const tokenCache = useTokensCache()
    const wallet = useWallet()

    return (
        <SwapFormStoreProvider
            coinToTip3Address={EverToTip3Address}
            comboToTip3Address={EverWeverToTip3Address}
            defaultLeftTokenAddress={WEVERRootAddress.toString()}
            defaultRightTokenAddress={USDTRootAddress.toString()}
            minTvlValue="50000"
            multipleSwapTokenRoot={WEVERRootAddress.toString()}
            safeAmount={SafeAmount}
            tip3ToCoinAddress={Tip3ToEverAddress}
            tokensCache={tokenCache}
            wallet={wallet}
            wrapGas={WrapGas}
            wrappedCoinVaultAddress={WeverVaultAddress}
        >
            <div className="container container--small">
                <Swap />
            </div>
        </SwapFormStoreProvider>
    )
}

import * as React from 'react'

import {
    EverToTip3Address,
    EverWeverToTip3Address,
    SafeAmount,
    // SwapReferrerAddress,
    Tip3ToEverAddress,
    USDTRootAddress,
    WEVERRootAddress,
    WeverVaultAddress,
    WrapGas,
} from '@/config'
import { Swap } from '@/modules/Swap'
import { SwapFormStoreProvider } from '@/modules/Swap/context'


export default function Page(): JSX.Element {
    return (
        <SwapFormStoreProvider
            coinToTip3Address={EverToTip3Address}
            comboToTip3Address={EverWeverToTip3Address}
            defaultLeftTokenAddress={WEVERRootAddress.toString()}
            defaultRightTokenAddress={USDTRootAddress.toString()}
            minTvlValue="50000"
            // referrer={SwapReferrerAddress.toString()}
            safeAmount={SafeAmount}
            tip3ToCoinAddress={Tip3ToEverAddress}
            wrapGas={WrapGas}
            wrappedCoinTokenAddress={WEVERRootAddress}
            wrappedCoinVaultAddress={WeverVaultAddress}
        >
            <div className="container container--small">
                <Swap />
            </div>
        </SwapFormStoreProvider>
    )
}

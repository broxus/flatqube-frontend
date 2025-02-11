import {
    TvmChains,
    inheritTextStyle,
    successLabelStyle,
    StandaloneClientAdapter,
} from '@broxus/js-core'
import { debug } from '@broxus/js-utils'
import {
    EverWallet,
    type RecentConnectionMeta,
    SparXWallet,
    type TvmWalletProviderConfig,
    TvmWalletService,
    getRecentConnectionMeta,
} from '@broxus/tvm-connect/lib'
import { ProviderRpcClient } from 'everscale-inpage-provider'

import { isEverWallet, isSparXWallet } from '@/environment'
import { useUniversalLink } from '@/hooks/useUniversalLink'
import { networks } from '@/config'

type PredefinedConfig = {
    networkId?: number
    providerId?: string
    providers: TvmWalletProviderConfig[]
}

const sparxWallet: TvmWalletProviderConfig = {
    connector: new SparXWallet(/* { autoInit: meta?.providerId === 'SparXWallet' && !meta?.disconnected } */),
    id: 'SparXWallet',
    info: {
        description: 'Your universal tool for TVM',
        icon: '/assets/icons/SparXWallet.svg',
        links: {
            android: 'https://play.google.com/store/apps/details?id=com.broxus.sparx.app',
            chromeExtension: 'https://chromewebstore.google.com/detail/sparx-wallet/aijecocmefcagpmbpjcfjjbcclfmobgf',
            homepage: 'https://sparxwallet.com/',
            ios: 'https://apps.apple.com/us/app/sparx-tvm-wallet/id6670219321',
            universalLink: useUniversalLink('https://l.sparxwallet.com', {
                apn: 'com.broxus.sparx.app',
                ibi: 'app.sparx.broxus.com',
                isi: '6670219321',
            }),
        },
        name: 'SparX Wallet',
    },
}
const everWallet: TvmWalletProviderConfig = {
    connector: new EverWallet(/* { autoInit: meta?.providerId === 'EverWallet' && !meta?.disconnected } */),
    id: 'EverWallet',
    info: {
        description: 'Premier wallet for the Everscale',
        icon: '/assets/icons/EverWallet.svg',
        links: {
            android: 'https://play.google.com/store/apps/details?id=com.broxus.crystal.app',
            chromeExtension: 'https://chrome.google.com/webstore/detail/ever-wallet/cgeeodpfagjceefieflmdfphplkenlfk',
            firefoxExtension: 'https://addons.mozilla.org/en-GB/firefox/addon/ever-wallet/',
            homepage: 'https://everwallet.net/',
            ios: 'https://apps.apple.com/us/app/ever-wallet-everscale/id1581310780',
        },
        name: 'Ever Wallet',
    },
}

function getPredefinedConfig(meta?: RecentConnectionMeta | undefined): PredefinedConfig {
    const providers: TvmWalletProviderConfig[] = []

    let providerId = meta?.providerId ?? sparxWallet.id,
        networkId = meta?.chainId ? Number(meta.chainId) : TvmChains.EverscaleMainnet

    if (isSparXWallet) {
        providers.push(sparxWallet)
        providerId = sparxWallet.id
        networkId = TvmChains.EverscaleMainnet
    }
    else if (isEverWallet) {
        providers.push(everWallet)
        providerId = everWallet.id
        networkId = TvmChains.EverscaleMainnet
    }
    else {
        providers.push(
            sparxWallet,
            {
                ...everWallet,
                minVersion: '0.3.40',
            },
        )
    }

    return { networkId, providerId, providers }
}

let service: TvmWalletService

export function useTvmWallet(): TvmWalletService {
    const recentMeta = getRecentConnectionMeta()
    if (!service) {
        const predefinedConfig = getPredefinedConfig(recentMeta)
        service = new TvmWalletService({
            connectionParams: {
                factory: network => new ProviderRpcClient({
                    provider: new StandaloneClientAdapter({
                        connection: network ? network.connectionProperties || {
                            data: {
                                endpoint: network.rpcUrl,
                            },
                            id: Number(network.chainId),
                            type: process.env.NODE_ENV === 'production' ? 'proto' : 'jrpc',
                        } : 'mainnetJrpc',
                    }),
                }),
            },
            defaultNetworkId: predefinedConfig.networkId,
            networks,
            providerId: predefinedConfig.providerId,
            providers: predefinedConfig.providers,
        })
        debug(
            `%c${service.constructor.name}%c has been created and ready to connect to Nekoton-compatible wallet`,
            successLabelStyle,
            inheritTextStyle,
        )
    }
    return service
}

import { Address, AddressLiteral } from 'everscale-inpage-provider'


export const WrapGas = '1000000000' // <= 1 EVER

export const SafeAmount = '10000000000' // <= 10 EVER

export const QubeDaoMinLockPeriod = 14

export const QubeDaoMaxLockPeriod = 1460

export const DexRootAddress = new AddressLiteral('0:5eb5713ea9b4a0f3a13bc91b282cde809636eb1e68d2fcb6427b9ad78a5a9008')

export const EverToTip3Address = new AddressLiteral('0:223217628e2a5eaaa38923ca60cff3877a3be4f366c35417952091becf2332ea')

export const Tip3ToEverAddress = new AddressLiteral('0:959c96f962cfba25e0d5117492a2b0e2f6a349d1a7b094494a9fe5c258fc4755')

export const EverWeverToTip3Address = new AddressLiteral('0:5f01f0d04a77db53f4f266cf5148e01e42ae74c6425b4e961cb91bd63a8b561b')

export const WeverVaultAddress = new AddressLiteral('0:557957cba74ab1dc544b4081be81f1208ad73997d74ab3b72d95864a41b779a4')

export const FarmFabricAddress = new AddressLiteral('0:c6774e6041b2ba4cf1898196d53a0562edd39b1816e5fb0079f7f64e324ec1e1')

export const WEVERRootAddress = new AddressLiteral('0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d')

export const USDTRootAddress = new AddressLiteral('0:a519f99bb5d6d51ef958ed24d337ad75a1c770885dcd42d51d6663f9fcdacfb2')
// export const USDTRootAddress = new AddressLiteral('0:3e92001079098a4b0727add5597108d2d87b530dad72037dd105202e40eec5b8')

export const QUBERootAddress = new AddressLiteral('0:9f20666ce123602fd7a995508aeaa0ece4f92133503c0dfbd609b3239f3901e2')

export const QUBEOwnerAddress = new AddressLiteral('0:ea09ee65b328dc3d68df3382c1651c204a13f0ca4d8bf86e6fdd65be71d78f40')

export const OldFarmAllocatorAddress = new AddressLiteral('0:a2b489a30c88648ab4bf98c2ba9d07c363c9d93e72a43a0625ff4644524582c6')

export const TokenFactoryAddress = new AddressLiteral('0:d291ab784f3ce6958fad0e473bcd61891b303cfe7a96e2c7074f20eadd500f44')

export const VoteEscrowAddress = new AddressLiteral('0:8317ae7ee92d748500e179843b587d7fbd98d6bb37402e2b44566f9f6f3cdd90')

export const GaugeFactoryAddress = new AddressLiteral('0:9509c21b9b098f6c47af3ce4b013da335ed96cb24367ba8de5b07001a1702441')

export const SwapReferrerAddress = new AddressLiteral('0:7a43a08e77dcc2bd7ce2f5f6798dbb84af9c8443e8bfb60c27e125033fef1760')

export const TokenListURI = 'https://raw.githubusercontent.com/broxus/flatqube-assets/master/manifest.json'

export const MinWalletVersion = '0.2.31'

export const API_URL = 'https://api.flatqube.io/v1'

export const API_V2_URL = 'https://api.flatqube.io/v2'

export const FARMING_POOL_API_URL = 'https://farming.flatqube.io/v1'

export const QUBE_API_URL = 'https://qube.flatqube.io/v1'

export const GAUGES_API_URL = 'https://farming.flatqube.io/v2'

export const TOKENS_API_URL = 'https://tokens.everscan.io/v1'

export const NPoolsList = new Map<
    string /* pool lp token root */,
    { poolAddress: Address, roots: { address: Address }[] }
>([
    ['0:155dfc30972a91b1737a3c75f8077f6d4f6c871753c1866407efaf43c3687723', {
        poolAddress: new AddressLiteral('0:71bbd09511797ba170911677f9300633a1143472c279b5b1bd6bd46cb666f929'),
        roots: [
            { address: new AddressLiteral('0:2d963fb029bf321d25c207f7c786dffa030387106861a9912b2d5e1cd90590ea') },
            { address: new AddressLiteral('0:84f7dc464665ee5be3c0e4065afa509041eaa9cded1308cdd29560dd630cdbf7') },
            { address: new AddressLiteral('0:b8b76afb475cbd64786d2c693fe8b182797c4b47194fa5f25749ee673e478b06') },
        ],
    }],
])

// export const P2P_API_URL = 'https://p2p-api-test.flatqube.io'
// export const backPK = '106925417688891724647234995036862332928925618442306815431062595410491768176622'
// export const LimitOrderFactoryRoot = new AddressLiteral('0:8948e51f0a2e672d2627837af1edaa398fdfe0230edd3daca36eb96acfa38a81')

export const P2P_API_URL = 'https://limit-api.flatqube.io'

export const backPK = '107109469055807608186892190796543593557361412273437038860260422366233567094150'

export const LimitOrderFactoryRoot = new AddressLiteral('0:3c8d39684cabbb780ff77710b02923c59ea2be84e211b09c3258eef344d394a4')

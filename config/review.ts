import { Address, AddressLiteral } from 'everscale-inpage-provider'


export const WrapGas = '1000000000' // <= 1 EVER

export const SafeAmount = '10000000000' // <= 10 EVER

export const MinTvlValue = '50000' // <= 50 000 USD

export const QubeDaoMinLockPeriod = 14

export const QubeDaoMaxLockPeriod = 1460

export const DexRootAddress = new AddressLiteral('0:5eb5713ea9b4a0f3a13bc91b282cde809636eb1e68d2fcb6427b9ad78a5a9008')

export const DexGasValuesAddress = new AddressLiteral('0:bf3adb71719dfc8c12c213f99a01668a15ea00203645e8b897cb1bd70e1bdb3d')

export const EverToTip3Address = new AddressLiteral('0:e1b253e92e6b7196b581fb999c67b419afb08c14161a1493e2325b9c47874e13')

export const Tip3ToEverAddress = new AddressLiteral('0:2987ed01b6691af900613b14d3327e43913822fc2e5490faf6896b4f6df5cb58')

export const EverWeverToTip3Address = new AddressLiteral('0:57f5d5f7ad0fa2f3486afb806be4f32274d38ca74c06ba3fb771374427e2fb72')

export const WeverVaultAddress = new AddressLiteral('0:557957cba74ab1dc544b4081be81f1208ad73997d74ab3b72d95864a41b779a4')

export const FarmFabricAddress = new AddressLiteral('0:c6774e6041b2ba4cf1898196d53a0562edd39b1816e5fb0079f7f64e324ec1e1')

export const WEVERRootAddress = new AddressLiteral('0:a49cd4e158a9a15555e624759e2e4e766d22600b7800d891e46f9291f044a93d')

export const USDTRootAddress = new AddressLiteral('0:a519f99bb5d6d51ef958ed24d337ad75a1c770885dcd42d51d6663f9fcdacfb2')

export const QUBERootAddress = new AddressLiteral('0:9f20666ce123602fd7a995508aeaa0ece4f92133503c0dfbd609b3239f3901e2')

export const QUBEOwnerAddress = new AddressLiteral('0:ea09ee65b328dc3d68df3382c1651c204a13f0ca4d8bf86e6fdd65be71d78f40')

export const OldFarmAllocatorAddress = new AddressLiteral('0:a2b489a30c88648ab4bf98c2ba9d07c363c9d93e72a43a0625ff4644524582c6')

export const TokenFactoryAddress = new AddressLiteral('0:d291ab784f3ce6958fad0e473bcd61891b303cfe7a96e2c7074f20eadd500f44')

export const VoteEscrowAddress = new AddressLiteral('0:8317ae7ee92d748500e179843b587d7fbd98d6bb37402e2b44566f9f6f3cdd90')

export const GaugeFactoryAddress = new AddressLiteral('0:9509c21b9b098f6c47af3ce4b013da335ed96cb24367ba8de5b07001a1702441')

export const SwapReferrerAddress = new AddressLiteral('0:0000000000000000000000000000000000000000000000000000000000000000')

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
>([])

export const USE_WHITE_LISTS = true

export const P2P_API_URL = 'https://limit-api.flatqube.io'

export const backPK = '107109469055807608186892190796543593557361412273437038860260422366233567094150'

export const LimitOrderFactoryRoot = new AddressLiteral('0:3c8d39684cabbb780ff77710b02923c59ea2be84e211b09c3258eef344d394a4')

export const DaoIndexerApiBaseUrl = 'https://dao.flatqube.io/v1'

export const DaoRootContractAddress = new AddressLiteral('0:30a16f53b909a0ae53580eab9532ab8e4e03889bfb00283ab5d543612c485188')

export const ScamTokens = [
    new AddressLiteral('0:1b056cffcd9f5dc9e30a8dd13346463f7a914292d6b25571c44ae24648bbfdd6'),
    new AddressLiteral('0:63f338a42ad02ddec8c3b7b12c46dc6cf609e601e96dba2ce0df3ee86843e66f'),
]

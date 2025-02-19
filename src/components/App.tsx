import * as React from 'react'
import { Settings } from 'luxon'
import {
    Redirect,
    Route,
    BrowserRouter as Router,
    Switch,
} from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { observer } from 'mobx-react-lite'
import { TvmWalletServiceProvider } from '@broxus/tvm-connect/lib'

import { ScrollManager } from '@/components/layout/ScrollManager'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { LocalizationContext } from '@/context/Localization'
import { useTvmWallet } from '@/hooks'
import { TokensUpgradesModal } from '@/modules/TokensUpgrades'
import Swap from '@/pages/swap'
import Limit from '@/pages/limit'
import Pools from '@/pages/pools'
import Pool from '@/pages/pools/item'
import PoolAddLiquidity from '@/pages/pools/liquidity/add'
import PoolRemoveLiquidity from '@/pages/pools/liquidity/remove'
import AddLiquidity from '@/pages/liquidity/add'
import RemoveLiquidity from '@/pages/liquidity/remove'
import Tokens from '@/pages/tokens'
import Token from '@/pages/tokens/item'
import Farmings from '@/pages/farming'
import Farming from '@/pages/farming/item'
import CreateFarming from '@/pages/farming/create'
import Gauges from '@/pages/gauges'
import Gauge from '@/pages/gauges/item'
import GaugesCalc from '@/pages/gauges/calc'
import CreateGauge from '@/pages/gauges/create'
import Dao from '@/pages/dao'
import Balance from '@/pages/dao/balance'
import Epoch from '@/pages/dao/epoch'
import CreateCandidate from '@/pages/dao/whitelisting'
import Builder from '@/pages/builder'
import CreateToken from '@/pages/builder/create'
import CustomToken from '@/pages/builder/token'
import Proposals from '@/pages/governance/proposals'
import ProposalCreate from '@/pages/governance/proposals/create'
import Proposal from '@/pages/governance/proposals/item'
import { appRoutes } from '@/routes'
import { isMobile } from '@/utils'

import './App.scss'


export const App = observer(() => {
    const localization = React.useContext(LocalizationContext)
    const wallet = useTvmWallet()

    React.useEffect(() => {
        Settings.defaultLocale = localization.locale
    }, [localization.locale])

    return (
        <TvmWalletServiceProvider wallet={wallet}>
            <Router>
                <ScrollManager>
                    <div className="wrapper">
                        <Header key="header" />

                        <main className="main">
                            <Switch>
                                <Route exact path="/">
                                    <Redirect exact to={appRoutes.swap.makeUrl()} />
                                </Route>

                                <Route path={appRoutes.swap.path}>
                                    <Swap />
                                </Route>

                                <Route path={appRoutes.limit.path}>
                                    <Limit />
                                </Route>

                                <Route exact path={appRoutes.pools.path}>
                                    <Pools />
                                </Route>
                                <Route exact path={appRoutes.pool.path}>
                                    <Pool />
                                </Route>
                                <Route exact path={appRoutes.poolAddLiquidity.path}>
                                    <PoolAddLiquidity />
                                </Route>
                                <Route exact path={appRoutes.poolRemoveLiquidity.path}>
                                    <PoolRemoveLiquidity />
                                </Route>

                                <Route exact path={appRoutes.liquidityAdd.path}>
                                    <AddLiquidity />
                                </Route>
                                <Route exact path={appRoutes.liquidityRemove.path}>
                                    <RemoveLiquidity />
                                </Route>

                                <Route exact path={appRoutes.tokens.path}>
                                    <Tokens />
                                </Route>
                                <Route exact path={appRoutes.token.path}>
                                    <Token />
                                </Route>

                                <Route exact path={appRoutes.farming.path}>
                                    <Farmings />
                                </Route>
                                <Route exact path={appRoutes.farmingCreate.path}>
                                    <CreateFarming />
                                </Route>
                                <Route exact path={appRoutes.farmingItem.path}>
                                    <Farming />
                                </Route>
                                <Route exact path={appRoutes.farmingItemUser.path}>
                                    <Farming />
                                </Route>

                                 <Route exact path={appRoutes.dao.path}>
                                 <Dao />
                                 </Route>
                                 <Route exact path={appRoutes.daoEpoch.path}>
                                 <Epoch />
                                 </Route>
                                 <Route exact path={appRoutes.daoBalance.path}>
                                 <Balance />
                                 </Route>
                                 <Route exact path={appRoutes.daoWhitelisting.path}>
                                 <CreateCandidate />
                                 </Route>

                                <Route exact path={appRoutes.gauges.path}>
                                    <Gauges />
                                </Route>
                                <Route exact path={appRoutes.gaugesCreate.path}>
                                    <CreateGauge />
                                </Route>
                                <Route exact path={appRoutes.gaugesCalc.path}>
                                    <GaugesCalc />
                                </Route>
                                <Route exact path={appRoutes.gaugesItem.path}>
                                    <Gauge />
                                </Route>

                                <Route exact path={appRoutes.builder.path}>
                                    <Builder />
                                </Route>
                                <Route exact path={appRoutes.builderCreate.path}>
                                    <CreateToken />
                                </Route>
                                <Route exact path={appRoutes.builderItem.path}>
                                    <CustomToken />
                                </Route>
                                <Route exact path={appRoutes.daoProposals.path}>
                                    <Proposals />
                                </Route>
                                <Route exact path={appRoutes.daoProposalsCreate.path}>
                                    <ProposalCreate />
                                </Route>
                                <Route exact path={appRoutes.daoProposal.path}>
                                    <Proposal />
                                </Route>
                            </Switch>
                        </main>
                        <Footer key="footer" />
                    </div>
                </ScrollManager>
                <ToastContainer
                    position={isMobile(navigator.userAgent)
                        ? toast.POSITION.TOP_CENTER
                        : toast.POSITION.BOTTOM_RIGHT}
                />
            </Router>

            <TokensUpgradesModal />
            {/* <P2PGlobalNotify /> */}
        </TvmWalletServiceProvider>
    )
})

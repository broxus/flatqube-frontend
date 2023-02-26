import * as React from 'react'
import { useIntl } from 'react-intl'
import { NavLink } from 'react-router-dom'

import { Badge } from '@/components/common/Badge'
import { Icon } from '@/components/common/Icon'
import { Nav } from '@/components/common/Nav'
import { Navbar } from '@/components/common/Navbar'
import { appRoutes } from '@/routes'

import './index.scss'


export function DesktopNav(): JSX.Element {
    const intl = useIntl()

    const expandIcon = React.useMemo(() => <Icon icon="arrowDown" className="nav__arrow" />, [])

    return (
        <Navbar.Nav className="desktop-nav flex-wrap width-expand">
            <Nav.Item key="swap">
                <NavLink to={appRoutes.swap.makeUrl()}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_SWAP' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="pools">
                <NavLink to={appRoutes.pools.makeUrl()}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_POOLS' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="tokens">
                <NavLink to={appRoutes.tokens.makeUrl()}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_TOKENS' })}
                </NavLink>
            </Nav.Item>
            <Nav.Sub
                key="farming"
                expandIcon={expandIcon}
                badge={<Badge>{intl.formatMessage({ id: 'GAUGE_NEW' })}</Badge>}
                title={intl.formatMessage({ id: 'NAV_LINK_TEXT_FARMING' })}
            >
                <Nav.Item key="farming_v1">
                    <NavLink to={appRoutes.farming.makeUrl()}>
                        {intl.formatMessage({ id: 'NAV_LINK_TEXT_FARMING_OLD' })}
                    </NavLink>
                </Nav.Item>
                <Nav.Item key="farming_v2">
                    <NavLink to={appRoutes.gauges.makeUrl()}>
                        {intl.formatMessage({ id: 'NAV_LINK_TEXT_FARMING_NEW' })}
                    </NavLink>
                </Nav.Item>
                <Nav.Item key="farming_calc">
                    <NavLink exact to={appRoutes.gaugesCalc.makeUrl()}>
                        {intl.formatMessage({
                            id: 'NAV_LINK_TEXT_FARMING_CALC',
                        })}
                    </NavLink>
                </Nav.Item>
            </Nav.Sub>
            <Nav.Item key="dao">
                <NavLink to={appRoutes.dao.makeUrl()}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_QUBE_DAO' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="builder">
                <NavLink to={appRoutes.builder.makeUrl()}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_BUILDER' })}
                </NavLink>
            </Nav.Item>
        </Navbar.Nav>
    )
}

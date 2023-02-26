import * as React from 'react'
import { useIntl } from 'react-intl'
import { NavLink } from 'react-router-dom'

import { Nav } from '@/components/common/Nav'
import { appRoutes } from '@/routes'

import './index.scss'

type Props = {
    onNavigate?: () => void;
}


export function DeviceNav({ onNavigate }: Props): JSX.Element {
    const intl = useIntl()

    return (
        <Nav className="device-nav" modifiers={['divider']}>
            <Nav.Item key="swap">
                <NavLink to={appRoutes.swap.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_SWAP' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="pools">
                <NavLink to={appRoutes.pools.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_POOLS' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="tokens">
                <NavLink to={appRoutes.tokens.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_TOKENS' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="farming_v1">
                <NavLink to={appRoutes.farming.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_FARMING_OLD' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="farming_v2">
                <NavLink to={appRoutes.gauges.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_FARMING_NEW' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="farming_calc">
                <NavLink exact to="/gauges/calc" onClick={onNavigate}>
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_FARMING_CALC',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="dao">
                <NavLink to={appRoutes.dao.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_QUBE_DAO' })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="builder">
                <NavLink to={appRoutes.builder.makeUrl()} onClick={onNavigate}>
                    {intl.formatMessage({ id: 'NAV_LINK_TEXT_BUILDER' })}
                </NavLink>
            </Nav.Item>
        </Nav>
    )
}

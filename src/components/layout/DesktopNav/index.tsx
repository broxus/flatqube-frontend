import * as React from 'react'
import { useIntl } from 'react-intl'
import { NavLink } from 'react-router-dom'

import { Nav } from '@/components/common/Nav'
import { Navbar } from '@/components/common/Navbar'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/common/Badge'

import './index.scss'


export function DesktopNav(): JSX.Element {
    const intl = useIntl()

    const expandIcon = React.useMemo(() => <Icon icon="arrowDown" className="nav__arrow" />, [])

    return (
        <Navbar.Nav className="desktop-nav flex-wrap width-expand">
            <Nav.Item key="swap">
                <NavLink to="/swap">
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_SWAP',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="pools">
                <NavLink
                    to="/pools"
                    isActive={(_, location) => location.pathname.indexOf('/pool') === 0}
                >
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_POOLS',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="tokens">
                <NavLink to="/tokens">
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_TOKENS',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="pairs">
                <NavLink to="/pairs">
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_PAIRS',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Sub
                key="farming"
                expandIcon={expandIcon}
                badge={(
                    <Badge>
                        {intl.formatMessage({
                            id: 'GAUGE_NEW',
                        })}
                    </Badge>
                )}
                title={intl.formatMessage({
                    id: 'NAV_LINK_TEXT_FARMING',
                })}
            >
                <Nav.Item key="farming_v1">
                    <NavLink to="/farming">
                        {intl.formatMessage({
                            id: 'NAV_LINK_TEXT_FARMING_OLD',
                        })}
                    </NavLink>
                </Nav.Item>
                <Nav.Item key="farming_v2">
                    <NavLink to="/gauges" exact>
                        {intl.formatMessage({
                            id: 'NAV_LINK_TEXT_FARMING_NEW',
                        })}
                    </NavLink>
                </Nav.Item>
                <Nav.Item key="farming_calc">
                    <NavLink exact to="/gauges/calc">
                        {intl.formatMessage({
                            id: 'NAV_LINK_TEXT_FARMING_CALC',
                        })}
                    </NavLink>
                </Nav.Item>
            </Nav.Sub>
            <Nav.Item key="dao">
                <NavLink to="/dao">
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_QUBE_DAO',
                    })}
                </NavLink>
            </Nav.Item>
            <Nav.Item key="builder">
                <NavLink to="/builder">
                    {intl.formatMessage({
                        id: 'NAV_LINK_TEXT_BUILDER',
                    })}
                </NavLink>
            </Nav.Item>
        </Navbar.Nav>
    )
}

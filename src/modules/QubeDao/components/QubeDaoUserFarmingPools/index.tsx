import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'

import styles from './index.module.scss'

export function QubeDaoUserFarmingPools(): JSX.Element {
    const intl = useIntl()

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'QUBE_DAO_BALANCE_USER_FARMING_POOLS_TITLE' })}
                </SectionTitle>
            </header>

            <div className="card card--flat card--small">
                <div className={classNames('list', styles.pools_list, styles.list)}>
                    <div className="list__header">
                        <div className="list__cell list__cell--left">
                            {intl.formatMessage({
                                id: 'QUBE_DAO_BALANCE_FARM_POOLS_LIST_HEADER_TITLE_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'QUBE_DAO_BALANCE_FARM_POOLS_LIST_HEADER_APR_BASE_CELL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'QUBE_DAO_BALANCE_FARM_POOLS_LIST_HEADER_APR_BOOSTED_CELL',
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/common/Icon'
import { Placeholder } from '@/components/common/Placeholder'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Chart } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Chart'
import { Stats } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Stats'
import { Timeline } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Timeline'
import { UserVotePreviewCard } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails/components/UserVotePreviewCard'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'


export function QubeDaoLastEpochDetails(): JSX.Element {
    const intl = useIntl()

    const epochStore = useQubeDaoEpochContext()

    React.useEffect(() => {
        epochStore.init().catch(reason => reason)
        return () => {
            epochStore.dispose().catch(reason => reason)
        }
    })

    return (
        <section className="section">
            <Observer>
                {() => (
                    <header className="section__header preserve">
                        <SectionTitle size="small">
                            {(epochStore.isFetchingEpoch || epochStore.isFetchingEpoch === undefined) ? (
                                <Placeholder height={28} width={90} />
                            ) : intl.formatMessage(
                                { id: 'QUBE_DAO_EPOCH_SHORT_TITLE' },
                                { value: epochStore.epochNum ?? '' },
                            )}
                        </SectionTitle>
                        <div className="section__header-actions">
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {(epochStore.isFetchingEpoch || epochStore.isFetchingEpoch === undefined) ? (
                                <Placeholder height={24} width={120} />
                            ) : epochStore.epochNum !== undefined ? (
                                <Link
                                    className="btn-with-icon text-bold"
                                    to={appRoutes.daoEpoch.makeUrl({
                                        epochNum: epochStore.epochNum.toString(),
                                    })}
                                >
                                    {intl.formatMessage({
                                        id: 'QUBE_DAO_EPOCH_DETAIL_LINK_TEXT',
                                    })}
                                    <Icon icon="chevronRight" ratio={0.8} />
                                </Link>
                            ) : null}
                        </div>
                    </header>
                )}
            </Observer>

            <div className={styles.stats_grid}>
                <div className="card card--flat card--xsmall" style={{ display: 'grid' }}>
                    <Timeline />
                </div>

                <div className={classNames(styles.stats_grid, styles.stats_grid__stat)}>
                    <Stats />
                    <div className={classNames(styles.stats_grid, styles.stats_grid__sub_stat)}>
                        <div className="card card--xsmall card--flat visible@s">
                            <Chart />
                        </div>
                        <UserVotePreviewCard />
                    </div>
                </div>
            </div>
        </section>
    )
}

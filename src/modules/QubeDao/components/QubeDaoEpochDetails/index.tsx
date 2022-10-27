import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { Timeline } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Timeline'
import { Stats } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Stats'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { Chart } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/Chart'

import styles from './index.module.scss'


export function QubeDaoEpochDetails(): JSX.Element {
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
                    <>
                        <header className="section__header">
                            <SectionTitle size="small">
                                {intl.formatMessage(
                                    { id: 'QUBE_DAO_EPOCH_TOTAL_INFO_TITLE' },
                                    { value: epochStore.epochNum ?? '' },
                                )}
                            </SectionTitle>
                        </header>

                        <div className={styles.stats_grid}>
                            <div className="card card--flat card--xsmall" style={{ display: 'grid' }}>
                                <Timeline />
                            </div>

                            <div className={classNames(styles.stats_grid, styles.stats_grid__stat)}>
                                <Stats />
                                <div className="card card--xsmall card--flat visible@s">
                                    <Chart />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Observer>
        </section>
    )
}

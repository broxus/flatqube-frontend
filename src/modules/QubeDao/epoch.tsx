import * as React from 'react'
import classNames from 'classnames'
import { DateTime } from 'luxon'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { PageHeader } from '@/components/common/PageHeader'
import { Placeholder } from '@/components/common/Placeholder'
import { QubeDaoEpochDetails } from '@/modules/QubeDao/components/QubeDaoEpochDetails'
import { StatusLabel } from '@/modules/QubeDao/components/QubeDaoEpochDetails/components/StatusLabel'
import { VotingStateFinishBanner } from '@/modules/QubeDao/components/QubeDaoEpochVotingState/components/VotingStateFinishBanner'
import { QubeDaoEpochVotingState } from '@/modules/QubeDao/components/QubeDaoEpochVotingState'
import { QubeDaoUserVotes } from '@/modules/QubeDao/components/QubeDaoUserVotes'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoVotingStateStoreProvider } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { appRoutes } from '@/routes'

import styles from './epoch.module.scss'


export function QubeDaoEpoch(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()

    return (
        <QubeDaoVotingStateStoreProvider>
            <Observer>
                {() => {
                    const isFetching = epochStore.isFetchingEpoch === undefined || epochStore.isFetchingEpoch

                    return (
                        <>
                            <PageHeader
                                actions={(
                                    <div
                                        className={classNames(
                                            styles.epoch__page_header_grid,
                                            styles.epoch__page_header_grid__actions,
                                        )}
                                    >
                                        <Button
                                            className="btn-with-icon"
                                            disabled={isFetching || epochStore.epochNum === 1}
                                            link={(isFetching || epochStore.epochNum === 1)
                                                ? undefined
                                                : appRoutes.daoEpoch.makeUrl({
                                                    epochNum: ((epochStore.epochNum ?? 1) - 1).toString(),
                                                })}
                                            type="secondary"
                                        >
                                            <Icon icon="chevronLeft" ratio={0.8} />
                                            {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_PREVIOUS_LINK_TEXT' })}
                                        </Button>
                                        <Button
                                            className="btn-with-icon"
                                            disabled={isFetching || epochStore.epochNum === daoContext.currentEpochNum}
                                            link={(isFetching || epochStore.epochNum === daoContext.currentEpochNum)
                                                ? undefined
                                                : appRoutes.daoEpoch.makeUrl({
                                                    epochNum: ((epochStore.epochNum ?? 1) + 1).toString(),
                                                })}
                                            type="secondary"
                                        >
                                            {intl.formatMessage({ id: 'QUBE_DAO_EPOCH_NEXT_LINK_TEXT' })}
                                            <Icon icon="chevronRight" ratio={0.8} />
                                        </Button>
                                    </div>
                                )}
                                breadcrumb={[
                                    {
                                        link: appRoutes.dao.makeUrl(),
                                        title: intl.formatMessage({ id: 'QUBE_DAO_BREADCRUMB_BALANCE_ROOT' }),
                                    },
                                    {
                                        title: intl.formatMessage(
                                            { id: 'QUBE_DAO_EPOCH_SHORT_TITLE' },
                                            { value: epochStore.epochNum },
                                        ),
                                    },
                                ]}
                                subtitle={(
                                    <div className={styles.epoch__page_header_grid}>
                                        {isFetching ? (
                                            <>
                                                <Placeholder height={24} width={100} />
                                                <Placeholder height={24} width={100} />
                                            </>
                                        ) : (
                                            <>
                                                {`${DateTime
                                                    .fromSeconds(epochStore.epochStart ?? 0)
                                                    .toFormat('dd.LL.yyyy')} - ${DateTime
                                                    .fromSeconds(epochStore.epochEnd ?? 0)
                                                    .toFormat('dd.LL.yyyy')}`}
                                                <StatusLabel
                                                    epochEnd={epochStore.epochEnd ?? 0}
                                                    epochStart={epochStore.epochStart ?? 0}
                                                    voteEnd={epochStore.voteEnd}
                                                    voteStart={epochStore.voteStart}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                                title={intl.formatMessage(
                                    { id: 'QUBE_DAO_EPOCH_SHORT_TITLE' },
                                    { value: epochStore.epochNum },
                                )}
                            />
                            {!isFetching && epochStore.votingEndAvailable && (
                                <VotingStateFinishBanner />
                            )}
                        </>
                    )
                }}
            </Observer>

            <QubeDaoEpochDetails />
            <QubeDaoUserVotes />
            <QubeDaoEpochVotingState />
        </QubeDaoVotingStateStoreProvider>
    )
}

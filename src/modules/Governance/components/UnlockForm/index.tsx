import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icon } from '@/components/common/Icon'
import { Popup } from '@/modules/Governance/components/Popup'
import { ContentLoader } from '@/components/common/ContentLoader'
import { Summary } from '@/modules/Governance/components/Summary'
import { Button } from '@/components/common/Button'
import { Table } from '@/modules/Governance/components/Table'
import { ProposalSummary } from '@/modules/Governance/components/ProposalSummary'
import { useUserProposals, usePagination } from '@/modules/Governance/hooks'
import { calcGazToUnlockVotes } from '@/modules/Governance/utils'
import { useVotingContext } from '@/modules/Governance/providers'
import { useWallet } from '@/stores/WalletService'
import { error, formattedAmount } from '@/utils'
import { Pagination } from '@/components/common/Pagination'
import { DaoConfigStore } from '@/modules/Governance/stores'

import './index.scss'

type Props = {
    onDismiss: () => void;
    onSuccess?: () => void;
}

// TODO: VotingPower
export function UnlockFormInner({
    onDismiss,
    onSuccess,
}: Props): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()
    const voting = useVotingContext()
    const userProposals = useUserProposals()
    const pagination = usePagination(userProposals.totalCount)

    const initializing = voting.castedVotes === undefined
        || userProposals.totalCount === undefined

    const hasCastedVotes = voting.castedVotes !== undefined
        && voting.castedVotes.length > 0

    const isAvailableUnlockAll = hasCastedVotes
        && voting.castedVotes.length === userProposals.totalCount

    const fetch = async () => {
        if (!wallet.address) {
            return
        }

        try {
            await userProposals.fetch(wallet.address, {
                locked: true,
                limit: pagination.limit,
                offset: pagination.offset,
                availableForUnlock: true,
                ordering: {
                    column: 'createdAt',
                    direction: 'DESC',
                },
            })
        }
        catch (e) {
            error(e)
        }
    }

    const onSubmit = async () => {
        try {
            if (!voting.castedVotes) {
                return
            }

            const success = await voting.unlockCastedVote(
                voting.castedVotes.map(([id]) => parseInt(id, 10)),
            )

            if (success) {
                onSuccess?.()

                if (pagination.totalPages > 1) {
                    if (pagination.page === 1) {
                        fetch()
                    }
                    else {
                        pagination.submit(1)
                    }
                }
            }
        }
        catch (e) {
            error(e)
        }
    }

    React.useEffect(() => {
        fetch()
    }, [
        pagination.page,
    ])

    return (
        <Popup
            scrollable
            className="unlock-form"
            disabled={voting.unlockLoading}
            onDismiss={onDismiss}
        >
            <h2 className="unlock-form__title">
                {intl.formatMessage({
                    id: 'UNLOCK_FORM_TITLE',
                })}
            </h2>

            {initializing ? (
                <div className="unlock-form__loader">
                    <ContentLoader size="s" slim />
                </div>
            ) : (
                <>
                    {isAvailableUnlockAll === true && (
                        <>
                            <Table
                                className="unlock-form__table"
                                loading={userProposals.loading}
                                cols={[{
                                    name: intl.formatMessage({
                                        id: 'UNLOCK_FORM_ID',
                                    }),
                                }, {
                                    name: intl.formatMessage({
                                        id: 'UNLOCK_FORM_SUMMARY',
                                    }),
                                }, {
                                    name: intl.formatMessage({
                                        id: 'UNLOCK_FORM_TOKENS',
                                    }),
                                    align: 'right',
                                }]}
                                rows={userProposals.items.map(({ proposal, vote }) => ({
                                    cells: [
                                        proposal.proposalId,
                                        proposal.state ? (
                                            <ProposalSummary
                                                id={proposal.proposalId}
                                                state={proposal.state}
                                                description={proposal.description}
                                            />
                                        ) : '–',
                                        voting.unlockedIds.includes(proposal.proposalId) ? (
                                            <Icon icon="successGreen" />
                                        ) : (
                                            formattedAmount(vote.votes, DaoConfigStore.tokenDecimals)
                                        ),
                                    ],
                                }))}
                            />

                            <Summary
                                items={[{
                                    key: intl.formatMessage({
                                        id: 'UNLOCK_FORM_GAZ',
                                    }),
                                    value: `${formattedAmount(calcGazToUnlockVotes(userProposals.items.length), wallet.coin.decimals)} ${wallet.coin.symbol}`,
                                }]}
                            />

                            {pagination.totalPages > 1 && (
                                <Pagination
                                    totalPages={pagination.totalPages}
                                    currentPage={pagination.page}
                                    onSubmit={pagination.submit}
                                    onNext={pagination.next}
                                    onPrev={pagination.prev}
                                />
                            )}
                        </>
                    )}

                    {hasCastedVotes && !isAvailableUnlockAll && (
                        <div className="unlock-form__empty">
                            {intl.formatMessage({
                                id: 'USER_VOTE_UNLOCK_ALL_HINT',
                            })}
                        </div>
                    )}

                    {!hasCastedVotes && !isAvailableUnlockAll && (
                        <div className="unlock-form__empty">
                            {intl.formatMessage({
                                id: 'UNLOCK_FORM_NO_PROPOSALS',
                            })}
                        </div>
                    )}
                </>
            )}

            <div className="unlock-form__actions">
                <Button
                    block
                    type="secondary"
                    disabled={voting.unlockLoading}
                    onClick={onDismiss}
                >
                    {intl.formatMessage({
                        id: 'UNLOCK_FORM_CANCEL',
                    })}
                </Button>

                <Button
                    block
                    type="primary"
                    disabled={userProposals.loading || voting.unlockLoading || !isAvailableUnlockAll}
                    onClick={onSubmit}
                >
                    {voting.unlockLoading ? (
                        <ContentLoader slim />
                    ) : (
                        intl.formatMessage({
                            id: 'UNLOCK_FORM_UNLOCK',
                        })
                    )}
                </Button>
            </div>
        </Popup>
    )
}

export const UnlockForm = observer(UnlockFormInner)

import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Summary } from '@/modules/Governance/components/Summary'
import { ContentLoader } from '@/components/common/ContentLoader'
import { useProposalContext, useVotingContext } from '@/modules/Governance/providers'
import { VotingForm } from '@/modules/Governance/components/VotingForm'
import { ProposalDates } from '@/modules/Governance/components/UserVote/Dates'
import { error, formattedAmount } from '@/utils'
import { DaoConfigStore } from '@/modules/Governance/stores'
import { ConnectButton } from '@/modules/WalletMiddleware/components/ConnectButton'
import { appRoutes } from '@/routes'

import './index.scss'

export function UserVoteInner(): JSX.Element {
    const intl = useIntl()
    const proposal = useProposalContext()
    const voting = useVotingContext()
    const [formVisible, setFormVisible] = React.useState(false)
    const [support, setSupport] = React.useState(false)
    const castedVote = voting.castedVotes?.find(([id]) => parseInt(id, 10) === proposal.id)
    const createdProposal = voting.createdProposals?.find(([id]) => parseInt(id, 10) === proposal.id)

    const showFormFn = (_support: boolean) => () => {
        setSupport(_support)
        setFormVisible(true)
    }

    const hideForm = () => {
        setFormVisible(false)
    }

    const castVote = async (reason?: string) => {
        if (!proposal.id) {
            return
        }
        try {
            proposal.autoResync.stop()
            await voting.castVote(proposal.id, support, reason)
            await proposal.sync()
            hideForm()
        }
        catch (e) {
            error(e)
        }
        proposal.autoResync.start()
    }

    const unlockTokens = async () => {
        if (!proposal.id) {
            return
        }
        try {
            await voting.unlockCastedVote([proposal.id])
        }
        catch (e) {
            error(e)
        }
    }

    const unlockVoteTokens = async () => {
        if (!proposal.id) {
            return
        }
        try {
            proposal.autoResync.stop()
            await voting.unlockVoteTokens(proposal.id)
        }
        catch (e) {
            error(e)
        }
        proposal.autoResync.start()
    }

    return (
        <div className="user-vote">
            <h3 className="user-vote__title">
                {intl.formatMessage({
                    id: 'USER_VOTE_TITLE',
                })}

                {(castedVote || proposal.userVote) && (
                    <Badge
                        className="user-vote__badge"
                        type={(castedVote?.[1] || proposal.userVote?.support) ? 'green' : 'red'}
                    >
                        {intl.formatMessage({
                            id: (castedVote?.[1] || proposal.userVote?.support) ? 'PROPOSALS_VOTE_1' : 'PROPOSALS_VOTE_0',
                        })}
                    </Badge>
                )}
            </h3>

            <Summary
                space="sm"
                items={[{
                    key: intl.formatMessage({
                        id: 'USER_VOTE_VOTING_WEIGHT',
                    }),
                    value: voting.tokenBalance
                        ? formattedAmount(voting.tokenBalance, DaoConfigStore.tokenDecimals)
                        : '–',
                }]}
            />

            <ConnectButton size="md">
                {/* eslint-disable no-nested-ternary */}
                {voting.loading || proposal.loading ? (
                    <Button
                        block
                        size="md"
                        type="secondary"
                    >
                        <ContentLoader slim />
                    </Button>
                ) : (
                    proposal.id && (
                        castedVote ? (
                            <>
                                <Button
                                    block
                                    size="md"
                                    type="secondary"
                                    disabled={proposal.state === 'Active' || voting.unlockLoading}
                                    onClick={unlockTokens}
                                >
                                    {voting.unlockLoading ? (
                                        <ContentLoader slim />
                                    ) : (
                                        intl.formatMessage({
                                            id: 'USER_VOTE_UNLOCK_TOKENS',
                                        })
                                    )}
                                </Button>

                                <div className="user-vote__hint">
                                    {intl.formatMessage({
                                        id: 'USER_VOTE_UNLOCK_HINT',
                                    })}
                                </div>
                            </>
                        ) : (
                            proposal.state === 'Active' ? (
                                new BigNumber(voting.tokenBalance || 0).eq(0) ? (
                                    <Button
                                        block
                                        size="md"
                                        type="secondary"
                                        link={appRoutes.daoBalance.makeUrl()}
                                        key="staking"
                                    >
                                        {intl.formatMessage({
                                            id: 'USER_VOTE_INCREASE_STAKE',
                                        })}
                                    </Button>
                                ) : (
                                    <div className="user-vote__actions">
                                        <Button
                                            block
                                            size="md"
                                            type="accept"
                                            onClick={showFormFn(true)}
                                            disabled={voting.castLoading}
                                            key="for"
                                        >
                                            {intl.formatMessage({
                                                id: 'USER_VOTE_FOR',
                                            })}
                                        </Button>

                                        <Button
                                            block
                                            size="md"
                                            type="danger"
                                            onClick={showFormFn(false)}
                                            disabled={voting.castLoading}
                                            key="against"
                                        >
                                            {intl.formatMessage({
                                                id: 'USER_VOTE_AGAINST',
                                            })}
                                        </Button>
                                    </div>
                                )
                            ) : (
                                proposal.state === 'Failed' && createdProposal ? (
                                    <Button
                                        block
                                        size="md"
                                        type="secondary"
                                        disabled={voting.unlockLoading}
                                        onClick={unlockVoteTokens}
                                    >
                                        {voting.unlockLoading ? (
                                            <ContentLoader slim />
                                        ) : (
                                            intl.formatMessage({
                                                id: 'USER_VOTE_UNLOCK_TOKENS',
                                            })
                                        )}
                                    </Button>
                                ) : (
                                    proposal.startTime && proposal.queuedAt && (
                                        <ProposalDates />
                                    )
                                )
                            )
                        )
                    )
                )}
            </ConnectButton>

            {formVisible && (
                <VotingForm
                    loading={voting.castLoading || voting.loading}
                    disabled={voting.castLoading}
                    support={support}
                    onDismiss={hideForm}
                    onSubmit={castVote}
                />
            )}
        </div>
    )
}

export const UserVote = observer(UserVoteInner)

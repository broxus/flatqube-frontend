/* eslint-disable no-confusing-arrow */
/* eslint-disable no-nested-ternary */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { Redirect } from 'react-router-dom'
import { Observer, observer } from 'mobx-react-lite'
import { Address } from 'everscale-inpage-provider'

import { ContentLoader } from '@/components/common/ContentLoader'
import { Section } from '@/modules/Governance/components/Section'
import { Button } from '@/components/common/Button'
import { Action, ActionPopup } from '@/modules/Governance/components/ProposalForm/ActionPopup'
import { Description } from '@/modules/Governance/components/ProposalForm/Description'
import { ActionList } from '@/modules/Governance/components/ProposalForm/ActionList'
import { useProposalCreateContext } from '@/modules/Governance/providers'
import {
    ActionNetwork, EthAction, ProposalType, TonAction,
} from '@/modules/Governance/types'
import { Select } from '@/components/common/Select'
import { CandidateForm } from '@/modules/Governance/components/ProposalForm/CandidateForm'
import { ConnectButton } from '@/modules/WalletMiddleware/components/ConnectButton'
import { VoteEscrowAddress } from '@/config'
import { appRoutes } from '@/routes'
import { useStaticRpc } from '@/hooks'
import { VoteEscrowAbi } from '@/misc'
import { error } from '@/utils'

import './index.scss'

function ProposalFormInner(): JSX.Element {
    const intl = useIntl()
    const proposalCreate = useProposalCreateContext()

    const [proposalType, setProposalType] = React.useState<ProposalType>()
    const [proposalId, setProposalId] = React.useState<string>()
    const [description, setDescription] = React.useState<string | undefined>()
    const [actions, setActions] = React.useState<Action[]>([])
    const [actionIndex, setActionIndex] = React.useState<number | undefined>()
    const [actionFormVisible, setActionFormVisible] = React.useState(false)

    const valid = description && actions.length > 0

    const showActionForm = () => setActionFormVisible(true)

    const hideActionForm = () => {
        setActionFormVisible(false)
        setActionIndex(undefined)
    }

    const editAction = (index: number) => {
        setActionIndex(index)
        showActionForm()
    }

    const removeAction = (index: number) => {
        setActions(prev => {
            const next = [...prev]
            next.splice(index, 1)
            return next
        })
    }

    const changeAction = (action: Action) => {
        setActions(prev => {
            const next = [...prev]
            if (actionIndex !== undefined) {
                next[actionIndex] = action
            }
            else {
                next.push(action)
            }
            return next
        })

        hideActionForm()
    }

    const onChangeCandidate = (remove: boolean) => async (address: string) => {
        const staticRpc = useStaticRpc()
        const voteEscrow = new staticRpc.Contract(VoteEscrowAbi.Root, VoteEscrowAddress)

        const payload = remove
            ? await voteEscrow.methods.removeGaugeDAO({
                gauge: new Address(address),
            }).encodeInternal()
            : await voteEscrow.methods.approveGaugeDAO({
                gauge: new Address(address),
            }).encodeInternal()

        setActions([{
            network: ActionNetwork.TON,
            data: {
                payload,
                target: VoteEscrowAddress.toString(),
                value: '1',
            },
        }])
    }

    const submit = async () => {
        if (!description) {
            return
        }
        try {
            const tonActions = actions.reduce<TonAction[]>((acc, item) => (
                item.network === ActionNetwork.TON ? [...acc, item.data] : acc
            ), [])
            const ethActions = actions.reduce<EthAction[]>((acc, item) => (
                item.network === ActionNetwork.ETH ? [...acc, item.data] : acc
            ), [])
            const id = await proposalCreate.submit(description, tonActions, ethActions)

            setProposalId(id)
        }
        catch (e) {
            error(e)
        }
    }

    React.useEffect(() => {
        setActions([])
    }, [proposalType])

    return proposalId ? (
        <Redirect
            to={appRoutes.daoProposal.makeUrl({
                id: proposalId,
            })}
        />
    ) : (
        <Section className="proposal-form">
            {actionFormVisible && (
                <ActionPopup
                    action={actionIndex !== undefined ? actions[actionIndex] : undefined}
                    onDismiss={hideActionForm}
                    onSubmit={changeAction}
                />
            )}

            <div className="proposal-form__layout">
                <div className="card card--flat card--xsmall">
                    <div className="proposal-form__title">
                        {intl.formatMessage({
                            id: 'PROPOSAL_FORM_DESCRIPTION',
                        })}
                    </div>

                    <Observer>
                        {() => (
                            <Description
                                onChange={setDescription}
                                disabled={proposalCreate.createLoading}
                            />
                        )}
                    </Observer>
                </div>

                <div className="card card--flat card--xsmall">
                    <div className="proposal-form__title">
                        {intl.formatMessage({
                            id: 'PROPOSAL_FORM_ACTIONS',
                        })}
                    </div>

                    <div className="proposal-form-popup__field">
                        <div className="proposal-form-label">
                            {intl.formatMessage({
                                id: 'PROPOSAL_FORM_TYPE_OF_ACTION',
                            })}
                        </div>

                        <Select
                            disabled={proposalCreate.createLoading}
                            value={proposalType}
                            onChange={setProposalType}
                            placeholder={intl.formatMessage({
                                id: 'PROPOSAL_FORM_SELECT_ACTION_TYPE',
                            })}
                            options={[{
                                value: ProposalType.Default,
                                label: intl.formatMessage({
                                    id: 'PROPOSAL_FORM_CUSTOM_ACTIONS',
                                }),
                            }, {
                                value: ProposalType.NewCandidate,
                                label: intl.formatMessage({
                                    id: 'PROPOSAL_FORM_NEW_CANDIDATE',
                                }),
                            }, {
                                value: ProposalType.RemoveCandidate,
                                label: intl.formatMessage({
                                    id: 'PROPOSAL_FORM_REMOVE_CANDIDATE',
                                }),
                            }]}
                        />
                    </div>

                    <Observer>
                        {() => proposalType === ProposalType.Default ? (
                            <div className="proposal-form-actions">
                                <ActionList
                                    actions={actions}
                                    onEdit={editAction}
                                    onRemove={removeAction}
                                    onAdd={showActionForm}
                                    disabled={proposalCreate.createLoading}
                                />
                            </div>
                        ) : proposalType === ProposalType.NewCandidate ? (
                            <CandidateForm
                                key="new"
                                disabled={proposalCreate.createLoading}
                                onChange={onChangeCandidate(false)}
                            />
                        ) : proposalType === ProposalType.RemoveCandidate ? (
                            <CandidateForm
                                key="remove"
                                disabled={proposalCreate.createLoading}
                                onChange={onChangeCandidate(true)}
                            />
                        ) : null}
                    </Observer>
                </div>
            </div>

            <div className="proposal-form__footer">
                <ConnectButton size="md" block={false}>
                    <Observer>
                        {() => (
                            <Button
                                size="md"
                                type="primary"
                                disabled={!valid || proposalCreate.createLoading}
                                onClick={submit}
                                className="proposal-form__submit"
                            >
                                {intl.formatMessage({
                                    id: 'PROPOSAL_FORM_SUBMIT',
                                })}
                                {proposalCreate.createLoading && (
                                    <ContentLoader slim />
                                )}
                            </Button>
                        )}
                    </Observer>
                </ConnectButton>
            </div>
        </Section>
    )
}

export const ProposalForm = observer(ProposalFormInner)

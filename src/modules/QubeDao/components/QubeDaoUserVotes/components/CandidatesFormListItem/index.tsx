import * as React from 'react'
import BigNumber from 'bignumber.js'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { AmountInput } from '@/components/common/AmountInput'
import { Icon } from '@/components/common/Icon'
import { Select } from '@/components/common/Select'
import { TokenIcon } from '@/components/common/TokenIcon'
import { QubeDaoCandidateItem, QubeDaoShareRate } from '@/modules/QubeDao/components/QubeDaoCommon'
import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoVotingStateStore } from '@/modules/QubeDao/providers/QubeDaoVotingStateProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import type { Candidate } from '@/modules/QubeDao/stores/QubeDaoVotingStateStore'
import { formattedTokenAmount, isGoodBignumber } from '@/utils'

import styles from './index.module.scss'

type Props = {
    candidate: Candidate;
    idx: number;
}

function CandidatesFormListItemInternal({ candidate, idx }: Props): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()
    const votesStore = useQubeDaoVotingStateStore()

    const calcPerCents = React.useCallback(
        (amount: string) => new BigNumber(amount || 0)
            .shiftedBy(daoContext.veDecimals)
            .div(daoContext.userVeBalance || 0)
            .times(100)
            .toFixed(),
        [],
    )

    const calcAmount = React.useCallback(
        (perCent: string) => new BigNumber(daoContext.userVeBalance || 0)
            .shiftedBy(-daoContext.veDecimals)
            .div(100)
            .times(perCent || 0)
            .toFixed(),
        [],
    )

    const remove = React.useCallback(() => {
        if (votesStore.candidates.length === 1) {
            return
        }
        votesStore.setData('candidates', votesStore.candidates.filter(
            ({ key }) => key !== candidate.key,
        ))
    }, [candidate.address])

    const isValid = React.useRef(true)
    const [perCent, setPerCent] = React.useState('')

    const maxAmountValue = new BigNumber(daoContext.userVeBalance || 0)
        .shiftedBy(-daoContext.veDecimals)
        .minus(
            new BigNumber(votesStore.scoredUserCandidatesAmount || 0)
                .shiftedBy(-daoContext.veDecimals)
                .minus(candidate.amount || 0),
        )

    const onChangeAddress = React.useCallback((value: string) => {
        runInAction(() => {
            // eslint-disable-next-line no-param-reassign
            candidate.address = value
        })
    }, [candidate])

    const onChangeAmount = React.useCallback((value: string) => {
        setPerCent(value === '' ? '' : calcPerCents(value))
        runInAction(() => {
            // eslint-disable-next-line no-param-reassign
            candidate.amount = value
        })
    }, [candidate])

    const onChangePerCent = React.useCallback((value: string) => {
        setPerCent(value)
        runInAction(() => {
            // eslint-disable-next-line no-param-reassign
            candidate.amount = calcAmount(value)
        })
    }, [candidate, candidate.amount])

    const onMaximizeAmount = React.useCallback(() => {
        onChangeAmount(isGoodBignumber(maxAmountValue.toFixed()) ? maxAmountValue.toFixed() : '0')
    }, [maxAmountValue.toFixed(), candidate.amount])

    isValid.current = isGoodBignumber(candidate.amount || 0, false) && maxAmountValue.gte(candidate.amount || 0)

    const candidatesAddresses = votesStore.candidates.map(({ address }) => address)
    const disabled = daoContext.isVotingEpoch || !isGoodBignumber(daoContext.userVeBalance ?? 0)
    const maxVotesRatio = new BigNumber(daoContext.maxVotesRatio || 0).shiftedBy(-2).toFixed()
    const minVotesRatio = new BigNumber(daoContext.minVotesRatio || 0).shiftedBy(-2).toFixed()

    const gaugeCurrentTotalAmount = votesStore.currentGaugeTotalAmount(candidate.address)
    const gaugeCurrentVoteShare = votesStore.currentGaugeVoteShare(candidate.address)

    const gaugeNextTotalAmount = new BigNumber(candidate.amount || 0)
        .dp(daoContext.veDecimals, BigNumber.ROUND_DOWN)
        .shiftedBy(daoContext.veDecimals)
        .plus(gaugeCurrentTotalAmount ?? 0)
    const gaugeNextVoteShare = gaugeNextTotalAmount
        .div(isGoodBignumber(votesStore.summaryVeAmount) ? (votesStore.summaryVeAmount ?? 1) : 1)
        .times(100)

    const gaugesList = React.useMemo(() => (
        <Select
            disabled={disabled}
            options={votesStore.gauges.map(gauge => ({
                disabled: candidatesAddresses.includes(gauge.address),
                label: (
                    <QubeDaoCandidateItem
                        address={gauge.address}
                        gaugeDetails={epochStore.gaugeDetails(gauge.address)}
                        linkable={false}
                        size="xsmall"
                    />
                ),
                value: gauge.address,
            }))}
            placeholder={intl.formatMessage({ id: 'QUBE_DAO_VOTE_FORM_GAUGE_FIELD_PLACEHOLDER' })}
            showArrow
            value={candidate.address}
            onChange={onChangeAddress}
        />
    ), [candidate.address, candidatesAddresses, votesStore.gauges])

    const gaugeAmountInput = React.useMemo(() => (
        <AmountInput
            decimals={daoContext.veDecimals}
            disabled={disabled || !candidate.address}
            invalid={!isValid.current}
            placeholder="0"
            prefix={(
                <TokenIcon
                    icon={daoContext.veIcon}
                    size="xsmall"
                />
            )}
            value={candidate.amount}
            onChange={onChangeAmount}
            onClickMax={onMaximizeAmount}
        />
    ), [
        disabled,
        candidate.address,
        candidate.amount,
        daoContext.token,
        daoContext.tokenAddress,
        daoContext.veDecimals,
        isValid.current,
        onMaximizeAmount,
    ])

    const gaugePercentageInput = React.useMemo(() => (
        <AmountInput
            disabled={disabled || !candidate.address}
            invalid={!isValid.current}
            placeholder="0"
            prefix={<span className="text-muted">%</span>}
            value={perCent}
            onChange={onChangePerCent}
            onClickMax={onMaximizeAmount}
        />
    ), [
        candidate.address,
        disabled,
        isValid.current,
        perCent,
        onMaximizeAmount,
    ])

    const removeButton = React.useMemo(() => (
        <Icon
            className="text-muted"
            icon="trash"
            ratio={0.8}
            style={{
                cursor:  votesStore.candidates.length === 1 ? undefined : 'pointer',
                pointerEvents: votesStore.candidates.length === 1 ? 'none' : undefined,
                visibility: votesStore.candidates.length === 1 ? 'hidden' : undefined,
            }}
            onClick={votesStore.candidates.length === 1 ? undefined : remove}
        />
    ), [votesStore.candidates.length])

    return (
        <Media query={{ minWidth: 640 }}>
            {matches => (matches ? (
                <div className="list__row">
                    <div className="list__cell list__cell--left" style={{ overflow: 'unset' }}>
                        {gaugesList}
                    </div>
                    <div className="list__cell list__cell--left">
                        {gaugeAmountInput}
                    </div>
                    <div className="list__cell list__cell--left">
                        {gaugePercentageInput}
                    </div>
                    {candidate.address ? (
                        <div className="list__cell list__cell--right visible@m">
                            {`${formattedTokenAmount(
                                gaugeCurrentTotalAmount,
                                daoContext.veDecimals,
                            )} ${daoContext.veSymbol}`}
                            <div className="text-sm">
                                <QubeDaoShareRate
                                    maxValue={maxVotesRatio}
                                    minValue={minVotesRatio}
                                    value={gaugeCurrentVoteShare}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="list__cell list__cell--right visible@m">
                            &mdash;
                        </div>
                    )}
                    {candidate.address ? (
                        <div className="list__cell list__cell--right visible@m">
                            {`${formattedTokenAmount(
                                gaugeNextTotalAmount.toFixed(),
                                daoContext.veDecimals,
                            )} ${daoContext.veSymbol}`}
                            <div className="text-sm">
                                <QubeDaoShareRate
                                    maxValue={maxVotesRatio}
                                    minValue={minVotesRatio}
                                    value={gaugeNextVoteShare.toFixed()}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="list__cell list__cell--right visible@m">
                            &mdash;
                        </div>
                    )}
                    <div className="list__cell list__cell--right visible@s">
                        {removeButton}
                    </div>
                </div>
            ) : (
                <div className={styles.candidate_compact_item}>
                    <div className={styles.candidate_compact_item__header}>
                        <span>
                            {intl.formatMessage({
                                id: 'QUBE_DAO_VOTE_FORM_CANDIDATE_NUMBER',
                            }, { number: idx })}
                        </span>
                        <span>{removeButton}</span>
                    </div>
                    <div>{gaugesList}</div>
                    <div>{gaugeAmountInput}</div>
                    <div>{gaugePercentageInput}</div>
                </div>
            ))}
        </Media>
    )
}

export const CandidatesFormListItem = observer(CandidatesFormListItemInternal)

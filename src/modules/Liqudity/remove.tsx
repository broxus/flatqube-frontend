import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { AmountInput } from '@/components/common/AmountInput'
import { Warning } from '@/components/common/Warning'
import { Placeholder } from '@/components/common/Placeholder'
import { CustomTokensAlerts, RemoveLiquiditySubmitButton } from '@/modules/Liqudity/components'
import { useRemoveLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import { useRemoveLiquidityForm } from '@/modules/Liqudity/hooks'
import { Token } from '@/modules/TokensList/components/Token'
import { TokenSelector } from '@/modules/TokensList/components/TokenSelector'
import type { URLTokensParams } from '@/routes'
import {
    error,
    formattedTokenAmount,
    isGoodBignumber,
    makeArray,
    stripHtmlTags,
    uniqueId,
} from '@/utils'

import './remove-liquidity.scss'

export function RemoveLiquidity(): JSX.Element {
    const intl = useIntl()
    const { leftTokenRoot, rightTokenRoot } = useParams<URLTokensParams>()

    const formStore = useRemoveLiquidityFormStoreContext()
    const form = useRemoveLiquidityForm()

    const onMaximize = () => {
        formStore.setData('amount', new BigNumber(formStore.pool?.lp.userBalance ?? 0).shiftedBy(-(formStore.pool?.lp.decimals ?? 0)).toFixed())
    }

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => formStore.tokensCache.isReady,
            async isReady => {
                formStore.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await form.resolveStateFromUrl(leftTokenRoot, rightTokenRoot)
                        await formStore.init()
                    }
                    catch (e) {
                        error('Remove Liquidity Form Store initializing error', e)
                    }
                    finally {
                        formStore.setState('isPreparing', false)
                    }
                }
            },
            { fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            formStore.dispose().catch(reason => error(reason))
        }
    }, [])

    return (
        <div className="card">
            <div className="card__wrap">
                <header className="card__header">
                    <h2 className="card-title">
                        {intl.formatMessage({
                            id: 'LIQUIDITY_REMOVE_HEADER_TITLE',
                        })}
                    </h2>
                </header>

                <Observer>
                    {() => {
                        const isSyncingPool = formStore.isSyncingPool === undefined || formStore.isSyncingPool
                        const tokensSelected = (
                            formStore.leftToken?.root !== undefined
                            && formStore.rightToken?.root !== undefined
                        )
                        return (
                            <div className="form liquidity-remove-form">
                                <div>
                                    <div className="liquidity-remove-form__label">
                                        {intl.formatMessage({
                                            id: 'LIQUIDITY_REMOVE_FORM_SELECT_PAIR',
                                        })}
                                    </div>
                                    <div className="liquidity-remove-form__cols">
                                        <TokenSelector
                                            disabled={isSyncingPool}
                                            root={formStore.leftToken?.root}
                                            showIcon
                                            size="medium"
                                            onSelect={form.onSelectLeftToken}
                                        />
                                        <TokenSelector
                                            disabled={isSyncingPool}
                                            root={formStore.rightToken?.root}
                                            showIcon
                                            size="medium"
                                            onSelect={form.onSelectRightToken}
                                        />
                                    </div>
                                </div>

                                {formStore.hasCustomToken && (
                                    <CustomTokensAlerts />
                                )}

                                {(
                                    formStore.wallet.isReady
                                    && formStore.pool !== undefined
                                    && !isGoodBignumber(formStore.pool?.lp.userBalance ?? 0)
                                    && formStore.isSyncingPool === false
                                    && tokensSelected
                                ) && (
                                    <Warning
                                        title={intl.formatMessage({
                                            id: 'LIQUIDITY_REMOVE_FORM_WARNING_NO_LP_TITLE',
                                        })}
                                        text={intl.formatMessage(
                                            { id: 'LIQUIDITY_REMOVE_FORM_WARNING_NO_LP_NOTE' },
                                            { symbol: stripHtmlTags(formStore.pool.lp.symbol ?? '') },
                                            { ignoreTag: true },
                                        )}
                                    />
                                )}

                                {(
                                    formStore.wallet.isReady
                                    && formStore.pool === undefined
                                    && formStore.isSyncingPool === false
                                    && tokensSelected
                                ) && (
                                    <Warning
                                        title={intl.formatMessage({
                                            id: 'LIQUIDITY_REMOVE_FORM_WARNING_NOT_EXIST_TITLE',
                                        })}
                                        text={intl.formatMessage({
                                            id: 'LIQUIDITY_REMOVE_FORM_WARNING_NOT_EXIST_NOTE',
                                        })}
                                    />
                                )}

                                {(isSyncingPool && tokensSelected) ? (
                                    <>
                                        <div>
                                            <div className="liquidity-remove-form__label">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_INPUT_AMOUNT',
                                                })}
                                            </div>

                                            <AmountInput disabled size="medium" />

                                            <div>&nbsp;</div>
                                        </div>

                                        <div>
                                            <div className="liquidity-remove-form__label liquidity-remove-form__label_medium">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_RECEIVE',
                                                })}
                                            </div>
                                            <div className="liquidity-remove-form__cols">
                                                {makeArray(2, uniqueId).map(id => (
                                                    <div
                                                        key={id}
                                                        className="liquidity-remove-form__receive"
                                                    >
                                                        <div
                                                            className="liquidity-remove-form__icons-placeholder"
                                                            style={{ gap: 7 }}
                                                        >
                                                            <Placeholder circle width={20} />
                                                            <Placeholder height={18} width={50} />
                                                        </div>
                                                        <div className="liquidity-remove-form__value">
                                                            &nbsp;
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="liquidity-remove-form__label liquidity-remove-form__label_medium">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_POSITION',
                                                })}
                                            </div>

                                            <div className="liquidity-remove-form-stats">
                                                <div className="liquidity-remove-form-stats__head">
                                                    <span />
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_NOW',
                                                        })}
                                                    </span>
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_AFTER',
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="liquidity-remove-form-stats__item">
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_SHARE',
                                                        })}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        <Placeholder height={20} width={60} />
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        —
                                                    </span>
                                                </div>

                                                {makeArray(2, uniqueId).map(id => (
                                                    <div key={id} className="liquidity-remove-form-stats__item">
                                                        <span>
                                                            <Placeholder height={20} width={60} />
                                                        </span>
                                                        <span className="liquidity-remove-form-stats__value">
                                                            <Placeholder height={20} width={60} />
                                                        </span>
                                                        <span className="liquidity-remove-form-stats__value">
                                                            —
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    formStore.wallet.isReady
                                    && formStore.pool !== undefined
                                    && formStore.leftToken !== undefined
                                    && formStore.rightToken !== undefined
                                    && isGoodBignumber(formStore.pool?.lp.userBalance ?? 0)
                                    && formStore.isSyncingPool === false
                                ) && (
                                    <>
                                        <div>
                                            <div className="liquidity-remove-form__label">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_INPUT_AMOUNT',
                                                })}
                                            </div>

                                            <AmountInput
                                                decimals={formStore.pool.lp.decimals}
                                                disabled={formStore.isWithdrawingLiquidity}
                                                invalid={!formStore.isAmountValid}
                                                maxIsVisible
                                                size="medium"
                                                value={formStore.amount}
                                                onChange={form.onChangeAmount}
                                                onClickMax={onMaximize}
                                            />

                                            <div
                                                className={classNames('liquidity-remove-form__hint', {
                                                    'liquidity-remove-form__hint_error': !formStore.isAmountValid,
                                                })}
                                                dangerouslySetInnerHTML={{
                                                    __html: formStore.isAmountValid
                                                        ? intl.formatMessage(
                                                            { id: 'LIQUIDITY_REMOVE_FORM_BALANCE' },
                                                            {
                                                                value: formattedTokenAmount(
                                                                    formStore.pool.lp.userBalance,
                                                                    formStore.pool.lp.decimals,
                                                                    { preserve: true, roundOn: false },
                                                                ),
                                                            },
                                                        )
                                                        : intl.formatMessage(
                                                            { id: 'LIQUIDITY_REMOVE_FORM_INSUFFICIENT_BALANCE' },
                                                            {
                                                                value: formattedTokenAmount(
                                                                    formStore.pool.lp.userBalance,
                                                                    formStore.pool.lp.decimals,
                                                                    { preserve: true, roundOn: false },
                                                                ),
                                                            },
                                                            { ignoreTag: true },
                                                        ),
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <div className="liquidity-remove-form__label liquidity-remove-form__label_medium">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_RECEIVE',
                                                })}
                                            </div>

                                            <div className="liquidity-remove-form__cols">
                                                <div className="liquidity-remove-form__receive">
                                                    <Token
                                                        address={formStore.leftToken.root}
                                                        size="xsmall"
                                                    />
                                                    <div className="liquidity-remove-form__value">
                                                        {formattedTokenAmount(formStore.isReverted
                                                            ? formStore.receiveRight
                                                            : formStore.receiveLeft)}
                                                    </div>
                                                </div>

                                                <div className="liquidity-remove-form__receive">
                                                    <Token
                                                        address={formStore.rightToken.root}
                                                        size="xsmall"
                                                    />
                                                    <div className="liquidity-remove-form__value">
                                                        {formattedTokenAmount(formStore.isReverted
                                                            ? formStore.receiveLeft
                                                            : formStore.receiveRight)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="liquidity-remove-form__label liquidity-remove-form__label_medium">
                                                {intl.formatMessage({
                                                    id: 'LIQUIDITY_REMOVE_FORM_POSITION',
                                                })}
                                            </div>

                                            <div className="liquidity-remove-form-stats">
                                                <div className="liquidity-remove-form-stats__head">
                                                    <span />
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_NOW',
                                                        })}
                                                    </span>
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_AFTER',
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="liquidity-remove-form-stats__item">
                                                    <span>
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_SHARE',
                                                        })}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {intl.formatMessage({
                                                            id: 'LIQUIDITY_REMOVE_FORM_SHARE_VALUE',
                                                        }, {
                                                            value: formattedTokenAmount(formStore.currentSharePercent),
                                                        })}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {isGoodBignumber(formStore.resultingSharePercent ?? 0)
                                                            ? intl.formatMessage(
                                                                { id: 'LIQUIDITY_REMOVE_FORM_SHARE_VALUE' },
                                                                { value: formStore.resultingSharePercent },
                                                            )
                                                            : '—'}
                                                    </span>
                                                </div>

                                                <div className="liquidity-remove-form-stats__item">
                                                    <span>
                                                        {formStore.leftToken.symbol}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {formattedTokenAmount(formStore.currentShareLeft || 0)}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {isGoodBignumber(formStore.resultingShareLeft ?? 0)
                                                            ? formattedTokenAmount(formStore.resultingShareLeft)
                                                            : '—'}
                                                    </span>
                                                </div>

                                                <div className="liquidity-remove-form-stats__item">
                                                    <span>
                                                        {formStore.rightToken.symbol}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {formattedTokenAmount(formStore.currentShareRight || 0)}
                                                    </span>
                                                    <span className="liquidity-remove-form-stats__value">
                                                        {isGoodBignumber(formStore.resultingShareRight ?? 0)
                                                            ? formattedTokenAmount(formStore.resultingShareRight)
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <RemoveLiquiditySubmitButton />
                            </div>
                        )
                    }}
                </Observer>
            </div>
        </div>
    )
}

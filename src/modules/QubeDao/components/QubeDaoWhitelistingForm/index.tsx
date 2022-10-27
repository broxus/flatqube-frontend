import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Placeholder } from '@/components/common/Placeholder'
import { TextInput } from '@/components/common/TextInput'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { LowBalanceBanner } from '@/modules/QubeDao/components/QubeDaoWhitelistingForm/components/LowBalanceBanner'
import { useQubeDaoWhitelistingFormContext } from '@/modules/QubeDao/providers/QubeDaoWhitelistingFormStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedTokenAmount } from '@/utils'
import { QubeDaoCandidateItem } from '@/modules/QubeDao/components/QubeDaoCommon'

import styles from './index.module.scss'

export function QubeDaoWhitelistingForm(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const whitelistingStore = useQubeDaoWhitelistingFormContext()

    const onChange = (value: string) => {
        whitelistingStore.setData('address', value)
    }

    React.useEffect(() => reaction(() => daoContext.tokensCache.isReady, async isReady => {
        if (isReady) {
            await whitelistingStore.init()
        }
    }, { fireImmediately: true }))

    return (
        <Observer>
            {() => {
                const isSyncingTokenBalance = (
                    daoContext.wallet.isInitializing
                    || daoContext.wallet.isConnecting
                    || ((daoContext.isSyncingTokenBalance === undefined
                    || daoContext.isSyncingTokenBalance)
                    && daoContext.wallet.isReady)
                )
                const isSyncingDetails = (
                    whitelistingStore.isSyncingDetails === undefined
                    || whitelistingStore.isSyncingDetails
                )
                return (
                    <>
                        {(!isSyncingTokenBalance
                        && !isSyncingDetails
                        && whitelistingStore.isLowBalance)
                        && <LowBalanceBanner />}

                        <form
                            className={classNames('form', styles.form_whitelisting)}
                            onSubmit={whitelistingStore.submit}
                        >
                            <div className="form-rows">
                                <label className="form-label width-expand" htmlFor="farming-pool">
                                    {intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_ADDRESS_FIELD_LABEL' })}
                                </label>
                                <TextInput
                                    disabled={whitelistingStore.isProcessing}
                                    id="farming-pool"
                                    invalid={whitelistingStore.address.length > 0 && !whitelistingStore.isAddressValid}
                                    placeholder={intl.formatMessage({
                                        id: 'QUBE_DAO_WHITELIST_FORM_ADDRESS_FIELD_PLACEHOLDER',
                                    })}
                                    size="medium"
                                    value={whitelistingStore.address}
                                    onChange={onChange}
                                />
                                {whitelistingStore.isAddressValid
                                && whitelistingStore.isAlreadyWhitelisted
                                && (
                                    <div className={styles.form_whitelisting_alert}>
                                        {intl.formatMessage({
                                            id: 'QUBE_DAO_WHITELIST_FORM_ALREADY_WHITELISTED_ALERT',
                                        })}
                                    </div>
                                )}
                                {whitelistingStore.isAddressValid
                                    && whitelistingStore.isFetchingGauge === false
                                    && whitelistingStore.gauge === undefined
                                    && (
                                        <div className={styles.form_whitelisting_alert}>
                                            {intl.formatMessage({
                                                id: 'QUBE_DAO_WHITELIST_FORM_INVALID_POOL_ADDRESS_ALERT',
                                            })}
                                        </div>
                                    )}
                                {whitelistingStore.isVotingState && (
                                    <div className={styles.form_whitelisting_alert}>
                                        {intl.formatMessage({
                                            id: 'QUBE_DAO_WHITELIST_FORM_VOTING_STATE_ALERT',
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className={classNames('card card--xsmall card--flat', styles.form_whitelisting__info)}>
                                <div className="form-rows">
                                    <div className="form-row">
                                        {intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_META_ADDRESS_LABEL' })}
                                        <div>
                                            {whitelistingStore.isAddressValid
                                            && whitelistingStore.gauge !== undefined
                                                ? (
                                                    <QubeDaoCandidateItem
                                                        address={whitelistingStore.gauge.address}
                                                        gaugeDetails={whitelistingStore.gauge.poolTokens}
                                                        linkable={false}
                                                    />
                                                ) : <>&mdash;</>}
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        {intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_META_BALANCE_LABEL' })}
                                        <div>
                                            {isSyncingTokenBalance ? (
                                                <Placeholder height={20} width={80} />
                                            ) : (
                                                <TokenAmountBadge
                                                    address={daoContext.tokenAddress.toString()}
                                                    amount={formattedTokenAmount(
                                                        daoContext.token?.balance,
                                                        daoContext.tokenDecimals,
                                                    )}
                                                    icon={daoContext.token?.icon}
                                                    symbol={daoContext.tokenSymbol}
                                                    size="xsmall"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <hr className="divider" />
                                    <div className={classNames('form-row', styles.form_whitelisting__info_total)}>
                                        {intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_META_PRICE_LABEL' })}
                                        <div>
                                            {isSyncingDetails ? (
                                                <Placeholder height={20} width={80} />
                                            ) : (
                                                <TokenAmountBadge
                                                    address={daoContext.tokenAddress.toString()}
                                                    amount={formattedTokenAmount(
                                                        whitelistingStore.price,
                                                        daoContext.tokenDecimals,
                                                        { preserve: true },
                                                    )}
                                                    icon={daoContext.token?.icon}
                                                    symbol={daoContext.tokenSymbol}
                                                    size="xsmall"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="width-expand"
                                disabled={whitelistingStore.isProcessing || !whitelistingStore.isValid}
                                size="lg"
                                type="primary"
                                onClick={whitelistingStore.submit}
                            >
                                {intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_SUBMIT_BTN_TEXT' })}
                            </Button>
                        </form>
                    </>
                )
            }}
        </Observer>
    )
}

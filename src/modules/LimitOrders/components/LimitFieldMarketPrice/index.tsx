import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Button } from '@/components/common/Button'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { FieldRate } from '@/modules/LimitOrders/components/LimitFieldMarketPrice/FieldRate'
import { useField } from '@/hooks/useField'
import { SwapDirection } from '@/modules/Swap/types'
import { P2PFormStore } from '@/modules/LimitOrders/stores/P2PFormStore'
import { Icon } from '@/components/common/Icon'

import './index.scss'

type Props = {
    balance?: string;
    disabled?: boolean;
    label?: string;
    id?: string;
    isMultiple?: boolean;
    isValid?: boolean;
    readOnly?: boolean;
    showMaximizeButton?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    onMarketPrice?: () => void;
    onToggleTokensList?: () => void;
}

function FieldMarketPrice({
    isValid = true,
    ...props
}: Props): JSX.Element {
    const intl = useIntl()
    const Sign = {
        above: intl.formatMessage({
            id: 'P2P_BTN_TEXT_MARKET_PRICE_DIRECTION_ABOVE',
        }),
        below: intl.formatMessage({
            id: 'P2P_BTN_TEXT_MARKET_PRICE_DIRECTION_BELOW',
        }),
        price: intl.formatMessage({
            id: 'P2P_BTN_TEXT_MARKET_PRICE_DIRECTION_PRICE',
        }),
    } as const
    const calcPercent = (p2p: P2PFormStore): { text: string, sign: string} => {
        if (!p2p.rtlPrice || !p2p.rtlMarketPrice || +p2p.rtlPrice === 0 || +p2p.rtlMarketPrice === 0) {
            return {
                sign: '-',
                text: '-',
            }
        }
        const value = new BigNumber(p2p.rtlPrice)
            .div(p2p.rtlMarketPrice)
            .minus(1)
            .times(100)
        return {
            // eslint-disable-next-line no-nested-ternary
            sign: value.toNumber() > 0
                ? Sign.above : value.toNumber() < 0
                    ? Sign.below
                    : Sign.price,
            text: value.lt(1000) ? value.toFixed(2) : '> 1000',
        }
    }
    const p2pFormStore = useP2PFormStoreContext()

    const field = useField({
        decimals: p2pFormStore.rateDirection === SwapDirection.RTL
            ? p2pFormStore.leftToken?.decimals
            : p2pFormStore.rightToken?.decimals,
        value: props.value,
        // eslint-disable-next-line sort-keys
        onChange: props.onChange,
    })

    const percent = calcPercent(p2pFormStore)
    const locked = p2pFormStore.priceLock === undefined || p2pFormStore.priceLock
    return (
        <label className="form-label" htmlFor={props.id}>
            <fieldset
                id="market-price-fieldset"
                className={classNames('form-fieldset limit', {
                    // checking: p2p.tokensCache.isTokenUpdatingBalance(token?.root) && !props.disabled,
                    invalid: !isValid,
                })}
            >
                <div id="input-div">
                    <input
                        autoComplete="off"
                        className="form-input"
                        id={props.id}
                        inputMode="decimal"
                        pattern="^[0-9]*[.]?[0-9]*$"
                        placeholder="0.0"
                        readOnly={props.readOnly}
                        type="text"
                        value={props?.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                    />
                    <FieldRate
                        leftToken={p2pFormStore.leftToken}
                        rightToken={p2pFormStore.rightToken}
                    />
                </div>

                <div className="form-fieldset__footer">
                    <div className="form-fieldset__footer-label">
                        {p2pFormStore.isCurrencyAvailable
                            && (
                                <Button
                                    key="market-price-button"
                                    id="market-price-button"
                                    className="form-btn-max"
                                    // disabled={}
                                    size="xs"
                                    type="secondary"
                                    onClick={props.onMarketPrice}
                                >
                                    {intl.formatMessage({
                                        id: 'P2P_BTN_TEXT_MARKET_PRICE',
                                    })}
                                </Button>
                            )}
                        <Button
                            key="lock-button"
                            id="lock-button"
                            className="form-btn-max"
                            size="xs"
                            type="ghost"
                            onClick={() => p2pFormStore.togglePriceLock()}
                        >
                            <Icon
                                id="lock-icon"
                                icon={locked ? 'lock' : 'unlock'}
                            />
                        </Button>
                    </div>
                    <div className="form-fieldset__footer-inner">
                        <div
                            key="token-balance" className={classNames({
                                above: percent.sign === Sign.above,
                                below: percent.sign === Sign.below,
                            })}
                        >
                            {intl.formatMessage({
                                id: 'P2P_MARKET_PRICE_RELATIVE',
                            }, {
                                direction: percent.sign.valueOf(),
                                percent: percent.text,
                            })}
                        </div>
                    </div>
                </div>
            </fieldset>
        </label>
    )
}


export const LimitFieldMarketPrice = observer(FieldMarketPrice)

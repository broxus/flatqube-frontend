import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Button } from '@/components/common/Button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useField } from '@/hooks/useField'
import type { LiquidityStablePoolTokenData } from '@/misc'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'
import { checkForScam } from '@/utils'

type Props = {
    balance?: string;
    disabled?: boolean;
    label?: string;
    id?: string;
    isCaution?: boolean;
    isValid?: boolean;
    readOnly?: boolean;
    showMaximizeButton?: boolean;
    token: LiquidityStablePoolTokenData;
    value?: string;
    onChange?: (value: string) => void;
    onKeyPress?: () => void;
    onMaximize?: () => void;
    onToggleTokensList?: () => void;
}


function Field({
    balance = '0',
    isValid = true,
    showMaximizeButton,
    token,
    ...props
}: Props): JSX.Element {
    const intl = useIntl()

    const formStore = useAddLiquidityFormStoreContext()

    const field = useField({
        decimals: token.decimals,
        value: props.value,
        // eslint-disable-next-line sort-keys
        onChange: (value: string) => {
            formStore.changeAmount(token.address.toString(), value)
            props.onChange?.(value)
        },
    })

    const isScam = token.symbol && checkForScam(token.symbol)

    const onMaximize = () => {
        const address = token.address.toString()
        const value = new BigNumber(formStore.getCombinedBalance(address)).dp(0).shiftedBy(-(token.decimals ?? 0))
        formStore.changeAmount(address, value.toFixed())
        props.onMaximize?.()
    }

    return (
        <label className="form-label" htmlFor={props.id}>
            <fieldset
                className={classNames('form-fieldset', {
                    caution: props.isCaution,
                    invalid: !isValid,
                })}
            >
                <div className="form-fieldset__main">
                    <input
                        autoComplete="off"
                        className="form-input"
                        id={props.id}
                        inputMode="decimal"
                        pattern="^[0-9]*[.]?[0-9]*$"
                        placeholder="0.0"
                        readOnly={props.readOnly}
                        type="text"
                        value={props.value}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                    />

                    <Button
                        key="change-token"
                        className="form-drop form-drop-extra disabled"
                        disabled
                    >
                        <span className="form-drop__logo">
                            <TokenIcon
                                address={token.address.toString()}
                                icon={token.icon}
                                name={token.symbol}
                                size="small"
                            />
                        </span>
                        <span className="form-drop__name">
                            {token.symbol}
                        </span>
                        {isScam && (
                            <span className="text-danger">
                                [SCAM]
                            </span>
                        )}
                    </Button>
                </div>
                <div className="form-fieldset__footer">
                    <div className="form-fieldset__footer-label truncate">
                        <div
                            className={classNames('truncate', {
                                'text-danger': !isValid,
                                'text-muted': isValid,
                            })}
                        >
                            {props.label}
                        </div>
                    </div>
                    <div className="form-fieldset__footer-inner">
                        {showMaximizeButton && (
                            <Button
                                key="max-button"
                                className="form-btn-max"
                                disabled={props.disabled}
                                size="xs"
                                type="link"
                                onClick={onMaximize}
                            >
                                Max
                            </Button>
                        )}
                        <div key="token-balance" className="swap-field-balance truncate">
                            {intl.formatMessage({
                                id: 'LIQUIDITY_ADD_FIELD_TOKEN_WALLET_BALANCE',
                            }, {
                                balance,
                            })}
                        </div>
                    </div>
                </div>
            </fieldset>
        </label>
    )
}


export const AddLiquidityField = observer(Field)

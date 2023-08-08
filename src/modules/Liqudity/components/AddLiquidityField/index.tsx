import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useField } from '@/hooks/useField'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'
import type { TokenCache } from '@/stores/TokensCacheService'
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
    token?: TokenCache;
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
    const field = useField({
        decimals: token?.decimals,
        value: props.value,
        // eslint-disable-next-line sort-keys
        onChange: props.onChange,
    })
    const formStore = useAddLiquidityFormStoreContext()

    const isScam = token?.symbol && checkForScam(token.symbol)

    return (
        <label className="form-label" htmlFor={props.id}>
            <fieldset
                className={classNames('form-fieldset', {
                    caution: props.isCaution,
                    checking: formStore.tokensCache.isTokenUpdatingBalance(token?.root) && !props.disabled,
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

                    {(() => {
                        switch (true) {
                            case token !== undefined:
                                return (
                                    <Button
                                        key="change-token"
                                        className={classNames('form-drop form-drop-extra', {
                                            disabled: props.disabled,
                                        })}
                                        disabled={props.disabled}
                                        onClick={props.onToggleTokensList}
                                    >
                                        <span className="form-drop__logo">
                                            <TokenIcon
                                                address={token?.root}
                                                icon={token?.icon}
                                                name={token?.symbol}
                                                size="small"
                                            />
                                        </span>
                                        <span className="form-drop__name">
                                            {token?.symbol}
                                        </span>
                                        {isScam && (
                                            <span className="form-drop__suffix">
                                                &nbsp;
                                                <span className="text-danger">[SCAM]</span>
                                            </span>
                                        )}
                                        <span className="form-drop__arrow">
                                            <Icon icon="arrowDown" ratio={1.2} />
                                        </span>
                                    </Button>
                                )

                            default:
                                return (
                                    <Button
                                        key="select-token"
                                        className={classNames('form-select', {
                                            disabled: props.disabled,
                                        })}
                                        disabled={props.disabled}
                                        onClick={props.onToggleTokensList}
                                    >
                                        <span className="form-select__txt">
                                            {intl.formatMessage({
                                                id: 'SWAP_FIELD_BTN_TEXT_SELECT_TOKEN',
                                            })}
                                        </span>
                                        <span className="form-select__arrow">
                                            <Icon icon="arrowDown" ratio={1.2} />
                                        </span>
                                    </Button>
                                )
                        }
                    })()}
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
                        {(
                            (token !== undefined)
                            && typeof props.onMaximize === 'function'
                            && showMaximizeButton
                        ) && (
                            <Button
                                key="max-button"
                                className="form-btn-max"
                                disabled={props.disabled}
                                size="xs"
                                type="link"
                                onClick={props.onMaximize}
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

import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { TextInput, TextInputProps } from '@/components/common/TextInput'
import { useField } from '@/hooks/useField'


type Props = {
    value?: string;
    decimals?: number;
    disabled?: boolean;
    maxIsVisible?: boolean;
    placeholder?: string;
    size?: TextInputProps['size'];
    id?: string;
    invalid?: boolean;
    prefix?: React.ReactNode;
    readOnly?: boolean;
    className?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: (value: string) => void;
    onClickMax?: () => void;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

export function AmountInput({
    decimals,
    disabled,
    id,
    invalid,
    maxIsVisible = true,
    placeholder,
    size = 'small',
    prefix,
    readOnly,
    className,
    onClickMax,
    onFocus,
    onBlur,
    ...props
}: Props): JSX.Element {
    const intl = useIntl()
    const field = useField({
        decimals,
        value: props.value,
        // eslint-disable-next-line sort-keys
        onBlur,
        onChange: props.onChange,
    })

    return (
        <div
            className={classNames('amount-input', className, {
                'amount-input_with-btn': maxIsVisible,
                [`amount-input_size_${size}`]: Boolean(size),
            })}
        >
            <TextInput
                value={props.value}
                disabled={disabled}
                size={size}
                id={id}
                invalid={invalid}
                inputMode="decimal"
                placeholder={placeholder ?? intl.formatMessage({
                    id: 'AMOUNT_INPUT_PLACEHOLDER',
                })}
                prefix={prefix}
                readOnly={readOnly}
                suffix={maxIsVisible && (
                    <Button
                        type="secondary"
                        className={classNames({
                            'btn-sm': size === 'small',
                        })}
                        onClick={onClickMax}
                        disabled={disabled}
                    >
                        {intl.formatMessage({
                            id: 'AMOUNT_INPUT_MAX',
                        })}
                    </Button>
                )}
                onBlur={field.onBlur}
                onChangeInput={field.onChange}
                onFocus={onFocus}
            />
        </div>
    )
}

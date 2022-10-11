import * as React from 'react'
import classNames from 'classnames'

import './index.scss'

export type TextInputProps = {
    placeholder?: string;
    value?: string;
    disabled?: boolean;
    id?: string;
    invalid?: boolean;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    size?: 'small' | 'medium';
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    readOnly?: boolean;
    className?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: (value: string) => void;
    onChangeInput?: React.ChangeEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

export function TextInput({
    placeholder,
    value = '',
    disabled,
    id,
    invalid,
    inputMode,
    size,
    prefix,
    suffix,
    readOnly,
    className,
    onBlur,
    onChange,
    onChangeInput,
    onFocus,
}: TextInputProps): JSX.Element {

    const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.currentTarget.value)
        onChangeInput?.(e)
    }

    return (
        <div
            className={classNames('text-input_wrapper', className, {
                'text-input_wrapper--dirty': value,
                'text-input_wrapper--invalid': invalid,
            })}
        >
            {prefix && (
                <div className="text-input_prefix">{prefix}</div>
            )}
            <div className="text-input_input">
                <input
                    autoComplete="off"
                    type="text"
                    className={classNames('text-input', {
                        [`text-input_size_${size}`]: Boolean(size),
                    })}
                    placeholder={placeholder}
                    id={id}
                    inputMode={inputMode}
                    value={value}
                    disabled={disabled}
                    readOnly={readOnly}
                    onBlur={onBlur}
                    onChange={_onChange}
                    onFocus={onFocus}
                />
            </div>
            {suffix && (
                <div className="text-input_suffix">{suffix}</div>
            )}
        </div>
    )
}

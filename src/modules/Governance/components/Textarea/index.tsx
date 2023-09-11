/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react'
import classNames from 'classnames'

import { Counter } from '@/modules/Governance/components/Counter'

import './index.scss'

type Props = {
    valid?: boolean;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
    showCounter?: boolean;
    rows?: number;
    onChange: (value: string) => void;
}

export function Textarea({
    valid,
    value,
    placeholder,
    disabled,
    maxLength,
    showCounter = true,
    rows,
    onChange,
}: Props): JSX.Element {
    const [dirty, setDirty] = React.useState(false)

    const change = (e: React.FormEvent<HTMLTextAreaElement>) => {
        setDirty(true)
        onChange(e.currentTarget.value)
    }

    return (
        <>
            <div
                className={classNames('textarea text-input_wrapper', {
                    'text-input_wrapper--invalid': valid === false && (dirty || value.length > 0),
                    'text-input_wrapper--dirty': value,
                })}
            >
                <textarea
                    rows={rows}
                    maxLength={maxLength}
                    onChange={change}
                    disabled={disabled}
                    className={classNames('textarea__input text-input')}
                    placeholder={placeholder}
                    value={value}
                />

            </div>

            {showCounter && maxLength !== undefined && (
                <Counter
                    length={value.length}
                    maxLength={maxLength}
                />
            )}
        </>
    )
}

import * as React from 'react'

import { Counter } from '@/modules/Governance/components/Counter'
import { TextInput } from '@/components/common/TextInput'

import './index.scss'

type Props = {
    label: string;
    value: string;
    valid?: boolean;
    limit?: number;
    length?: number;
    disabled?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
}

export function TextField({
    label,
    value,
    valid,
    limit,
    length,
    disabled,
    placeholder,
    onChange,
}: Props): JSX.Element {
    const [dirty, setDirty] = React.useState(false)

    const change = (val: string) => {
        setDirty(true)
        onChange(val)
    }

    return (
        <div className="proposal-form-popup__field">
            <div className="proposal-form-label">
                {label}
            </div>

            <TextInput
                value={value}
                onChange={change}
                placeholder={placeholder}
                disabled={disabled}
                invalid={valid === false && (dirty || value.length > 0)}
            />

            {limit !== undefined && length !== undefined && (
                <Counter
                    maxLength={limit}
                    length={length}
                />
            )}
        </div>
    )
}

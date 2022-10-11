import * as React from 'react'
import classNames from 'classnames'

import { Icon } from '@/components/common/Icon'

import './index.scss'

type Props = {
    checked?: boolean
    label?: string
    disabled?: boolean;
    onChange?: (checked: boolean) => void
}

export function Checkbox({
    checked,
    label,
    disabled,
    onChange,
}: Props): JSX.Element {
    return (
        <label
            className={classNames('checkbox', {
                checkbox_disabled: disabled,
            })}
        >
            <input
                type="checkbox"
                disabled={disabled}
                checked={Boolean(checked)}
                onChange={() => onChange && onChange(!checked)}
            />
            <div className="checkbox__icon">
                <Icon icon="check" />
            </div>
            <div>{label}</div>
        </label>
    )
}

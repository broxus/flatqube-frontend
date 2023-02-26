import * as React from 'react'
import classNames from 'classnames'

import { Icon } from '@/components/common/Icon'

import './index.scss'

type Props = {
    checked?: boolean
    label?: string
    disabled?: boolean;
    value?: any;
    style?: React.CSSProperties;
    onChange?: (checked: boolean, value?: any) => void
}

export function Checkbox({
    checked,
    label,
    disabled,
    value,
    style,
    onChange,
}: Props): JSX.Element {
    return (
        <label
            className={classNames('checkbox', {
                checkbox_disabled: disabled,
            })}
            style={style}
        >
            <input
                type="checkbox"
                disabled={disabled}
                checked={Boolean(checked)}
                onChange={() => onChange && onChange(!checked, value)}
            />
            <div className="checkbox__icon">
                <Icon icon="check" ratio={1.5} />
            </div>
            <div>{label}</div>
        </label>
    )
}

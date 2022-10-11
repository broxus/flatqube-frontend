import * as React from 'react'
import classNames from 'classnames'

import { Icon } from '@/components/common/Icon'

import './index.scss'

type Props = {
    size?: 'xs' | 's' | 'l'
    className?: string;
}

export function Spinner({
    size,
    className,
}: Props): JSX.Element {
    return (
        <Icon
            className={classNames('spinner', size, className)}
            icon="loader"
        />
    )
}

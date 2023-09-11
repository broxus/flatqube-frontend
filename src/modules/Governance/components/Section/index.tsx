import * as React from 'react'
import classNames from 'classnames'

import './index.scss'

export * from '@/modules/Governance/components/Section/Header'
export * from '@/modules/Governance/components/Section/Actions'
export * from '@/modules/Governance/components/Section/Title'
export * from '@/modules/Governance/components/Section/Container'
export * from '@/modules/Governance/components/Section/Description'
export * from '@/modules/Governance/components/Section/Line'

type Props = {
    id?: string;
    children: React.ReactNode;
    className?: string;
}

export function Section({
    id,
    children,
    className,
}: Props): JSX.Element {
    return (
        <div
            id={id}
            className={classNames('content-section', className)}
        >
            {children}
        </div>
    )
}

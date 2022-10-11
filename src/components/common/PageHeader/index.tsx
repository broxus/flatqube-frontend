import * as React from 'react'

import { Breadcrumb, BreadcrumbItem } from '@/components/common/Breadcrumb'

import './index.scss'

type Props = {
    actions?: React.ReactNode | React.ReactNode[];
    breadcrumb?: BreadcrumbItem[];
    subtitle?: React.ReactNode;
    title: React.ReactNode;
}

export function PageHeader(props: Props): JSX.Element {
    const { actions, breadcrumb, subtitle, title } = props

    return (
        <header className="page_header">
            {breadcrumb !== undefined && breadcrumb.length > 0 && (
                <Breadcrumb items={breadcrumb} />
            )}
            <div className="page_header__inner">
                <div>
                    <h1 className="page_header__title">{title}</h1>
                    {subtitle && (
                        <div className="page_header__subtitle">{subtitle}</div>
                    )}
                </div>
                {actions !== undefined && (
                    <div className="page_header__actions">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    )
}

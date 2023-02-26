import * as React from 'react'
import classNames from 'classnames'

import { Breadcrumb, BreadcrumbItem } from '@/components/common/Breadcrumb'

import './index.scss'

type Props = {
    actions?: React.ReactNode | React.ReactNode[];
    breadcrumb?: BreadcrumbItem[];
    className?: string;
    subtitle?: React.ReactNode;
    title: React.ReactNode;
}

export function PageHeader(props: Props): JSX.Element {
    const { actions, breadcrumb, className, subtitle, title } = props

    return (
        <header className={classNames('page_header', className)}>
            {breadcrumb !== undefined && breadcrumb.length > 0 && (
                <Breadcrumb items={breadcrumb} />
            )}
            <div className="page_header__inner">
                <div className="page_header__title_wrapper">
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

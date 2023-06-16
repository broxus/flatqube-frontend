import * as React from 'react'
import classNames from 'classnames'

import './index.scss'

type Props = {
    rightActions?: React.ReactNode | React.ReactNode[];
    className?: string;
    title?: React.ReactNode;
    leftActions?: React.ReactNode | React.ReactNode[];
}

export function ChartHeader(props: Props): JSX.Element {
    const {
        rightActions, className, leftActions, title,
    } = props

    return (
        <header className={classNames('chart_header', className)}>
            <div className="chart_header__inner">
                <div className="chart_header__title_wrapper">
                    {title && (
                        <span className="chart_header__title visible@m">{title}</span>
                    )}
                    {leftActions !== undefined && (
                        <div className="chart_header__actions">
                            {leftActions}
                        </div>
                    )}
                </div>
                {rightActions !== undefined && (
                    <div className="chart_header__actions">
                        {rightActions}
                    </div>
                )}
            </div>
        </header>
    )
}

import * as React from 'react'
import { NavLink } from 'react-router-dom'

import './index.scss'

export type BreadcrumbItem = {
    link?: string
    title: React.ReactNode
}

type Props = {
    items: BreadcrumbItem[]
}

export function Breadcrumb({
    items,
}: Props): JSX.Element {
    return (
        <ul className="breadcrumb">
            {/* eslint-disable react/no-array-index-key */}
            {items.map(({ link, title }, index) => (
                <li key={index}>
                    {link ? (
                        <NavLink to={link}>{title}</NavLink>
                    ) : (
                        <span>{title}</span>
                    )}
                </li>
            ))}
        </ul>
    )
}

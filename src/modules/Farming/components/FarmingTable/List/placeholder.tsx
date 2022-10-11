import * as React from 'react'

import { Placeholder as PlaceholderBase } from '@/components/common/Placeholder'

import './index.scss'

export function FarmingTableListPlaceholder(): JSX.Element {
    return (
        <div className="farming-table-list__item">
            <div className="farming-table-list__line">
                <PlaceholderBase width={150} />

                <div className="farming-table-list__rewards">
                    <PlaceholderBase circle width={24} />
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__apr">
                    <PlaceholderBase width={80} />
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__label">
                    <PlaceholderBase width={100} />
                </div>
                <div className="farming-table-list__value">
                    <PlaceholderBase width={50} />
                </div>
            </div>

            <div className="farming-table-list__line">
                <div className="farming-table-list__label">
                    <PlaceholderBase width={100} />
                </div>
                <div className="farming-table-list__value">
                    <PlaceholderBase width={50} />
                </div>
            </div>
        </div>
    )
}

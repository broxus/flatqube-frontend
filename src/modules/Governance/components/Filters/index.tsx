import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Popup } from '@/modules/Governance/components/Filters/popup'
import { useDropdown } from '@/hooks/useDropdown'
import { zip } from '@/utils'

import './index.scss'

export * from '@/modules/Governance/components/Filters/date'
export * from '@/modules/Governance/components/Filters/radio'
export * from '@/modules/Governance/components/Filters/text'
export * from '@/modules/Governance/components/Filters/field'
export * from '@/modules/Governance/components/Filters/token'
export * from '@/modules/Governance/components/Filters/check'

type Props<T> = {
    filters: T;
    onChange: (filters: T) => void;
    children: (filters: T, change: (key: keyof T) => (value: T[keyof T]) => void) => React.ReactNode;
}

export function Filters<T extends Object>({
    filters,
    onChange,
    children,
}: Props<T>): JSX.Element {
    const intl = useIntl()
    const filterDropdown = useDropdown()

    const [localFilters, setLocalFilters] = React.useState<T>(filters)

    const count = Object.values(filters).filter(item => item !== undefined).length

    const clearEnabled = count > 0

    const applyEnabled = zip(Object.values(filters), Object.values(localFilters))
        .some(([a, b]) => a !== b)

    const changeLocalFilter = (key: keyof T) => (
        (value: T[keyof T]) => {
            setLocalFilters(prev => ({ ...prev, [key]: value }))
        }
    )

    const apply = () => {
        onChange(localFilters)
    }

    const clear = () => {
        onChange({} as T)
    }

    React.useEffect(() => {
        setLocalFilters(filters)
    }, [filters])

    return (
        <div className="filters">
            <div className="filters__filter">
                <Button
                    type="secondary"
                    onClick={filterDropdown.open}
                >
                    {intl.formatMessage({
                        id: 'FILTERS_FILTER',
                    })}

                    {count > 0 && (
                        <span className="filters__counter">{count}</span>
                    )}
                </Button>

                {filterDropdown.visible && (
                    <div ref={filterDropdown.popupRef}>
                        <Popup
                            onApply={apply}
                            onClear={clear}
                            applyEnabled={applyEnabled}
                            clearEnabled={clearEnabled}
                        >
                            {children(localFilters, changeLocalFilter)}
                        </Popup>
                    </div>
                )}
            </div>
        </div>
    )
}

import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { formattedAmount } from '@/utils'

import './index.scss'

export type PaginationProps = {
    className?: string;
    currentPage?: number;
    disabled?: boolean;
    totalPages: number;
    onNext?: () => void;
    onPrev?: () => void;
    onSubmit?: (value: number) => void;
}

export const Pagination = React.memo(({
    className,
    currentPage = 1,
    disabled,
    totalPages = 0,
    onNext,
    onPrev,
    onSubmit,
}: PaginationProps): JSX.Element => {
    const intl = useIntl()

    const [value, setValue] = React.useState<string>(currentPage.toString())

    const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        setValue(event.target.value)
    }

    const onKeyUp: React.KeyboardEventHandler<HTMLInputElement> = event => {
        if (event.keyCode === 13) {
            let newPage = parseInt(value, 10)

            if (Number.isNaN(newPage)) {
                return
            }
            if (newPage > totalPages) {
                newPage = totalPages
                setValue(totalPages.toString())
            }
            else if (newPage <= 0) {
                newPage = 1
                setValue('1')
            }
            onSubmit?.(newPage)
        }
    }

    React.useEffect(() => {
        setValue(currentPage.toString())
    }, [currentPage])

    return (
        <div className={classNames('pagination', className)}>
            <div className="pagination__txt">
                {intl.formatMessage({
                    id: 'PAGINATION_BEFORE_TEXT',
                })}
            </div>
            <input
                className="pagination__input"
                inputMode="decimal"
                readOnly={disabled}
                type="text"
                value={value}
                onChange={onChange}
                onKeyUp={onKeyUp}
            />
            <div className="pagination__txt">
                {intl.formatMessage({
                    id: 'PAGINATION_PAGE_OF',
                }, {
                    totalPages: formattedAmount(totalPages),
                })}
            </div>
            <Button
                className="pagination__btn"
                disabled={disabled || currentPage === 1}
                type="icon"
                onClick={onPrev}
            >
                <Icon icon="chevronLeft" />
            </Button>
            <Button
                className="pagination__btn"
                disabled={disabled || currentPage === totalPages}
                type="icon"
                onClick={onNext}
            >
                <Icon icon="chevronRight" />
            </Button>
        </div>
    )
})

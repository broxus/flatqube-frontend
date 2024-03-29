import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { ContentLoader } from '@/components/common/ContentLoader'
import { Row } from '@/modules/Governance/components/Table/row'
import { Align, Cell } from '@/modules/Governance/components/Table/cell'

import './index.scss'

export * from '@/modules/Governance/components/Table/cell'
export * from '@/modules/Governance/components/Table/row'

type Col<O> = {
    name?: string;
    align?: Align;
    ascending?: O;
    descending?: O;
}

type Cell = string | React.ReactNode

type Row = {
    link?: string;
    cells: Cell[];
};

type Props<O> = {
    cols: Col<O>[];
    rows?: Row[];
    rawRows?: React.ReactNode[];
    order?: O;
    className?: string;
    loading?: boolean;
    body?: React.ReactNode;
    onSort?: (order: O) => void;
}

export function Table<O>({
    cols,
    rows,
    rawRows,
    order,
    className,
    loading,
    body,
    onSort,
}: Props<O>): JSX.Element {
    const intl = useIntl()

    const emptyMsg = (
        <div className="table__empty">
            {intl.formatMessage({
                id: 'EMPTY_LIST',
            })}
        </div>
    )

    return (
        <div className={classNames('list table', className)}>
            <div className="list__header">
                {cols.map((col, index) => (
                    /* eslint-disable react/no-array-index-key */
                    <Cell<O>
                        key={index}
                        align={col.align}
                        ascending={col.ascending}
                        descending={col.descending}
                        order={order}
                        onSort={onSort}
                    >
                        {col.name}
                    </Cell>
                ))}
            </div>

            <div className="table__body">
                {body || (
                    <>
                        {!loading && (
                            <>
                                {!rows && !rawRows && emptyMsg}
                                {rows && rows.length === 0 && emptyMsg}
                                {rawRows && rawRows.length === 0 && emptyMsg}
                            </>
                        )}

                        {rawRows ? (
                            rawRows.map(item => item)
                        ) : (
                            rows && rows.length > 0 && (
                                rows.map((row, i) => (
                                    /* eslint-disable react/no-array-index-key */
                                    <Row key={i} link={row.link}>
                                        {row.cells.map((cell, j) => (
                                            <Cell align={cols[j].align} key={j}>
                                                {cell}
                                            </Cell>
                                        ))}
                                    </Row>
                                ))
                            )
                        )}
                    </>
                )}


                <div
                    className={classNames('table__loader', {
                        table__loader_active: loading,
                    })}
                >
                    <ContentLoader slim />
                </div>
            </div>
        </div>
    )
}

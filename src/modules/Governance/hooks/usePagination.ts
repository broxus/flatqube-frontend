/* eslint-disable sort-keys */
import * as React from 'react'

type UrlPagination = {
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
    totalCount?: number;
    submit: (page: number) => void;
    next: () => void;
    prev: () => void;
}

const LIMIT = 10

export function usePagination(totalCount?: number): UrlPagination {
    const [params, setParams] = React.useState({
        page: 1,
        limit: LIMIT,
    })

    const submit = React.useCallback((page: number, limit?: number) => {
        setParams({
            page,
            limit: limit || LIMIT,
        })
    }, [])

    const next = React.useCallback(() => {
        setParams(value => ({
            ...value,
            page: value.page + 1,
        }))
    }, [])

    const prev = React.useCallback(() => {
        setParams(value => ({
            ...value,
            page: value.page - 1,
        }))
    }, [])

    const offset = (params.page - 1) * params.limit
    const totalPages = Math.ceil((totalCount || 1) / params.limit)

    return React.useMemo(() => ({
        offset,
        totalPages,
        totalCount,
        page: params.page,
        limit: params.limit,
        submit,
        next,
        prev,
    }), [offset, totalCount, totalCount, params.page, params.limit])
}

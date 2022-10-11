import * as React from 'react'
import { useIntl } from 'react-intl'

import { sliceAddress } from '@/utils'


type Props = {
    children?: React.ReactChild | React.ReactChild[] | null;
    className?: string;
    id: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function TransactionExplorerLink({ children, className, id, onClick }: Props): JSX.Element {
    const intl = useIntl()

    return (
        <a
            className={className}
            href={`https://everscan.io/transactions/${id}`}
            title={intl.formatMessage({ id: 'OPEN_IN_EXPLORER' })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
        >
            {children || sliceAddress(id)}
        </a>
    )
}

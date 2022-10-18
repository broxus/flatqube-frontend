import * as React from 'react'
import { useIntl } from 'react-intl'

import { sliceAddress } from '@/utils'


type Props = React.PropsWithChildren<{
    address: string;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}>

export function AccountExplorerLink(props: Props): JSX.Element {
    const intl = useIntl()

    const { address, children, className, onClick } = props

    return (
        <a
            className={className}
            href={`https://everscan.io/accounts/${address}`}
            title={intl.formatMessage({ id: 'OPEN_IN_EXPLORER' })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
        >
            {children || sliceAddress(address)}
        </a>
    )
}

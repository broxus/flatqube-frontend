import * as React from 'react'
import { useIntl } from 'react-intl'

import { Token } from '@/modules/Governance/components/Token'
import { Select } from '@/components/common/Select'
import { TokenCache } from '@/stores/TokensCacheService'

import './index.scss'

type Props = {
    tokens: TokenCache[];
    tokenAddress?: string;
    onChange: (tokenAddress: string) => void;
}

export function TokenFilter({
    tokens,
    tokenAddress,
    onChange,
}: Props): JSX.Element {
    const intl = useIntl()

    return (
        <Select
            allowClear
            options={tokens.map(({ root, icon, symbol }) => ({
                label: (
                    <Token
                        address={root}
                        symbol={symbol}
                        uri={icon}
                        size="xsmall"
                    />
                ),
                value: root,
            }))}
            value={tokenAddress}
            onChange={onChange}
            placeholder={intl.formatMessage({
                id: 'FILTERS_TOKEN',
            })}
        />
    )
}

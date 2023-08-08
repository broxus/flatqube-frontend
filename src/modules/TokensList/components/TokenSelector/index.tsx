import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TokensList } from '@/modules/TokensList'
import { useTokensCache } from '@/stores/TokensCacheService'

import './index.scss'
import { checkForScam } from '@/utils'

type Props = {
    disabled?: boolean;
    root?: string;
    onOpen?: () => void;
    onClose?: () => void;
    onSelect?: (root: string) => void;
    size?: 'small' | 'medium';
    showIcon?: boolean;
}

export function TokenSelector({
    disabled,
    root,
    onOpen,
    onClose,
    onSelect,
    size = 'small',
    showIcon,
}: Props): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const token = tokensCache.get(root)
    const [listVisible, setListVisible] = React.useState(false)

    const placeholder = intl.formatMessage({
        id: 'TOKEN_SELECTOR_PLACEHOLDER',
    })

    const isScam = token?.symbol && checkForScam(token.symbol)

    const close = () => {
        setListVisible(false)
        if (onClose) {
            onClose()
        }
    }

    const open = () => {
        setListVisible(true)
        if (onOpen) {
            onOpen()
        }
    }

    const select = (_root: string) => {
        if (onSelect) {
            onSelect(_root)
        }
        close()
    }

    React.useEffect(() => {
        if (root) {
            (async () => {
                await tokensCache.syncCustomToken(root)
            })()
        }
    }, [root])

    return (
        <>
            <Button
                disabled={disabled}
                className={classNames('token-selector', {
                    'token-selector_dirty': Boolean(token),
                    [`token-selector_size_${size}`]: Boolean(size),
                })}
                onClick={open}
            >
                <span
                    className="token-selector__value"
                    title={token ? token.symbol : placeholder}
                >
                    {showIcon && token && (
                        <TokenIcon
                            size="small"
                            address={token.root}
                            icon={token.icon}
                        />
                    )}
                    <span className="token-selector__symbol">
                        {token ? token.symbol : placeholder}
                    </span>
                    {isScam && (
                        <>
                            &nbsp;
                            <span className="text-danger">[SCAM]</span>
                        </>
                    )}
                </span>
                <Icon icon="arrowDown" />
            </Button>

            {listVisible && (
                <TokensList
                    onDismiss={close}
                    onSelectToken={select}
                />
            )}
        </>
    )
}

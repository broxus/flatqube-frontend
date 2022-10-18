import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Icons, toast } from 'react-toastify'
import classNames from 'classnames'

import { ContentLoader } from '@/components/common/ContentLoader'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { notify, NotifyType } from '@/modules/Notification'
import { OutdatedToken, useTokensUpgrades } from '@/modules/TokensUpgrades'
import { formattedTokenAmount, isMobile } from '@/utils'

const TOAST_ID = 'upgrade-tokens-notify'


export function TokensUpgradesModal(): JSX.Element | null {
    const intl = useIntl()
    const tokensUpgrades = useTokensUpgrades()

    const [isOpen, setOpen] = React.useState(false)

    const hideNotification = () => {
        toast.dismiss(TOAST_ID)
    }

    const onDismiss = () => {
        hideNotification()
        tokensUpgrades.cleanup()
    }

    const onOpen = () => {
        hideNotification()
        setOpen(true)
    }

    const showNotification = () => {
        setOpen(false)
        notify(
            <div
                className={classNames('notification-actions', {
                    'notification-actions--large': isMobile(navigator.userAgent),
                })}
            >
                <Button type={isMobile(navigator.userAgent) ? 'link' : 'secondary'} onClick={onOpen}>
                    {intl.formatMessage({ id: 'TOKENS_UPGRADE_NOTIFICATION_UPGRADE_BTN_TEXT' })}
                </Button>
                <Button type="link" onClick={onDismiss}>
                    {intl.formatMessage({ id: 'TOKENS_UPGRADE_NOTIFICATION_DISMISS_BTN_TEXT' })}
                </Button>
            </div>,
            intl.formatMessage(
                { id: 'TOKENS_UPGRADE_NOTIFICATION_TITLE' },
                { value: tokensUpgrades.tokens.length },
            ),
            {
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                icon: Icons.info,
                toastId: TOAST_ID,
                type: NotifyType.INFO,
            },
        )
    }

    const upgrade = (token: OutdatedToken) => async () => {
        await tokensUpgrades.upgrade(token)
    }

    React.useEffect(() => reaction(
        () => [tokensUpgrades.isCheckingUpgrades, tokensUpgrades.hasTokensToUpgrade],
        ([isCheckingUpgrades, hasTokensToUpgrade]) => {
            if (!isCheckingUpgrades && hasTokensToUpgrade) {
                showNotification()
            }
        },
    ), [])

    return isOpen ? (
        <Observer>
            {() => {
                if (!tokensUpgrades.hasTokensToUpgrade) {
                    return null
                }

                return ReactDOM.createPortal(
                    <div className="popup">
                        <div className="popup-overlay" />
                        <div className="popup__wrap">
                            <Button
                                type="icon"
                                className="popup-close"
                                onClick={showNotification}
                            >
                                <Icon icon="close" />
                            </Button>
                            <h2 className="popup-title">
                                {intl.formatMessage({
                                    id: 'TOKENS_UPGRADE_POPUP_TITLE',
                                })}
                            </h2>
                            <div
                                className="popup-txt"
                                dangerouslySetInnerHTML={{
                                    __html: intl.formatMessage({
                                        id: 'TOKENS_UPGRADE_POPUP_NOTE',
                                    }),
                                }}
                            />
                            <Observer>
                                {() => (
                                    <div className="popup-list">
                                        {tokensUpgrades.tokens.map(token => {
                                            const isTokenUpgraded = tokensUpgrades.isTokenUpgraded(token.rootV4)
                                            const isTokenUpgrading = tokensUpgrades.isTokenUpgrading(token.rootV4)
                                            return isTokenUpgraded ? null : (
                                                <div key={token.rootV4} className="popup-item">
                                                    <div className="popup-item__left">
                                                        <div className="popup-item__icon">
                                                            <TokenIcon
                                                                address={token.rootV4}
                                                                name={token.symbol}
                                                                size="small"
                                                                icon={token.logoURI}
                                                            />
                                                        </div>
                                                        <div className="popup-item__main">
                                                            <div className="popup-item__name">
                                                                {token.symbol}
                                                            </div>
                                                            <div className="popup-item__txt">
                                                                {token.name}
                                                                {' | '}
                                                                Version: 4
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="popup-item__right"
                                                        style={{ alignItems: 'center', display: 'flex' }}
                                                    >
                                                        <span>
                                                            {formattedTokenAmount(
                                                                token.balance,
                                                                token.decimals,
                                                            )}
                                                        </span>
                                                        <Button
                                                            type="primary"
                                                            disabled={isTokenUpgrading}
                                                            className="btn-with-icon"
                                                            style={{ marginLeft: 10 }}
                                                            onClick={(
                                                                token.proxy === undefined
                                                                            && isTokenUpgrading
                                                            ) ? undefined : upgrade(token)}
                                                        >
                                                            {intl.formatMessage({
                                                                id: isTokenUpgrading
                                                                    ? 'TOKENS_UPGRADE_UPGRADING_BTN_TEXT'
                                                                    : 'TOKENS_UPGRADE_UPGRADE_BTN_TEXT',
                                                            })}
                                                            {isTokenUpgrading && (
                                                                <ContentLoader slim size="s" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </Observer>
                        </div>
                    </div>,
                    document.body,
                )
            }}
        </Observer>
    ) : null
}

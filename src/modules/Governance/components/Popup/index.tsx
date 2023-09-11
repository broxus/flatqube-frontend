import * as React from 'react'
import * as ReactDOM from 'react-dom'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { usePage } from '@/hooks'

type Props = {
    className?: string;
    disabled?: boolean;
    onDismiss: () => void;
    children: React.ReactNode | React.ReactNodeArray;
    scrollable?: boolean;
}

export function Popup({
    className,
    disabled,
    onDismiss,
    children,
    scrollable,
}: Props): JSX.Element {
    const page = usePage()

    React.useEffect(() => {
        if (scrollable) {
            page.block()

            return () => {
                page.unblock()
            }
        }

        return undefined
    }, [scrollable])

    return ReactDOM.createPortal(
        <div
            className={classNames('popup', {
                popup_scrollable: scrollable === true,
            })}
        >
            <div
                className="popup-overlay"
                onClick={disabled ? undefined : onDismiss}
            />

            <div className={`popup__wrap ${className}`}>
                <Button
                    type="icon"
                    className="popup-close"
                    onClick={onDismiss}
                    disabled={disabled}
                >
                    <Icon icon="close" />
                </Button>

                {children}
            </div>
        </div>,
        document.body,
    )
}

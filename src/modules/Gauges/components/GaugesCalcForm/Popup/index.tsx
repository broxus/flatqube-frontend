import * as ReactDOM from 'react-dom'
import classNames from 'classnames'
import * as React from 'react'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { usePage } from '@/hooks/usePage'

import styles from './index.module.scss'

type Props = {
    onClose: () => void,
    children?: React.ReactNode;
}

export function GaugesCalcFormPopup({
    onClose,
    children,
}: Props): JSX.Element {
    const page = usePage()

    React.useEffect(() => {
        page.block()

        return () => {
            page.unblock()
        }
    }, [])

    return ReactDOM.createPortal(
        <div className="popup popup_scrollable">
            <div className="popup-overlay" />
            <div className={classNames('popup__wrap', styles.popupWrap)}>
                <Button
                    type="icon"
                    className="popup-close"
                    onClick={onClose}
                >
                    <Icon icon="close" />
                </Button>

                {children}
            </div>
        </div>,
        document.body,
    )
}

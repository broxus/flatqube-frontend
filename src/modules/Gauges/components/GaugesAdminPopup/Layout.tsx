import * as React from 'react'
import classNames from 'classnames'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'

import styles from './index.module.scss'

type Props = {
    children?: React.ReactNode;
    onClose?: () => void;
}

export function AdminPopupLayout({
    children,
    onClose,
}: Props): JSX.Element {
    return (
        <div className={classNames('popup popup_scrollable', styles.popup)}>
            <div className="popup-overlay" />
            <div className="popup__wrap">
                <Button
                    type="icon"
                    className="popup-close"
                    onClick={onClose}
                >
                    <Icon icon="close" />
                </Button>

                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    )
}

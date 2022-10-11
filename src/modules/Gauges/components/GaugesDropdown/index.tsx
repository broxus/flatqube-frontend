import * as React from 'react'
import classNames from 'classnames'

import { Drop } from '@/components/common/Drop'
import { Icon } from '@/components/common/Icon'
import { GaugesToolBtn } from '@/modules/Gauges/components/GaugesToolBtn'

import styles from './index.module.scss'

type Props = {
    minWidth?: number;
    width?: number;
    hideOnClickInside?: boolean;
    color?: 'light' | 'gray';
    content: React.ReactNode;
    children: React.ReactNode;
}

export function GaugesDropdown({
    minWidth,
    width,
    content,
    children,
    hideOnClickInside = true,
    color = 'gray',
}: Props): JSX.Element {
    const [visible, setVisible] = React.useState(false)

    const show = () => setVisible(true)
    const hide = () => setVisible(false)

    return (
        <Drop
            placement="bottom-right"
            trigger="click"
            visible={visible}
            onOverlayClick={hideOnClickInside ? hide : undefined}
            onVisibleChange={setVisible}
            minOverlayWidthMatchTrigger={width ? false : undefined}
            overlayStyle={{
                width: width ? `${width}px` : undefined,
            }}
            overlay={(
                <div className={styles.dropdown}>
                    <div
                        className={styles.inner}
                        style={{
                            minWidth: minWidth ? `${minWidth}px` : undefined,
                        }}
                    >
                        {content}
                    </div>
                </div>
            )}
        >
            <GaugesToolBtn
                onClick={show}
                className={classNames(styles.trigger, styles[color])}
            >
                {children}
                <Icon className={styles.arrow} icon="arrowDown" />
            </GaugesToolBtn>
        </Drop>
    )
}

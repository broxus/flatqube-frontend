import * as React from 'react'
import classNames from 'classnames'

import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'


export function CardPlaceholder(): JSX.Element {
    return (
        <div className={classNames('card card--xsmall card--flat', styles.user_vote_preview_card)}>
            <div>
                <div className={styles.user_vote_preview_card__supheader}>
                    <Placeholder height={20} width={60} />
                </div>
                <Placeholder height={28} width={150} />
                <div className={styles.user_vote_preview_card__note}>
                    <Placeholder height={18} width={220} />
                    <Placeholder height={18} width={200} />
                </div>
            </div>
        </div>
    )
}

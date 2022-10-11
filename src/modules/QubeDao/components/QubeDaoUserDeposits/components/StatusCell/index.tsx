import * as React from 'react'
import classNames from 'classnames'
import { useIntl } from 'react-intl'


type Props = {
    isLocked: boolean;
}

export function StatusCell({ isLocked }: Props): JSX.Element {
    const intl = useIntl()

    return (
        <div
            className={classNames('label', {
                'label--default': !isLocked,
                'label--success': isLocked,
            })}
        >
            {intl.formatMessage({
                id: isLocked
                    ? 'QUBE_DAO_USER_DEPOSITS_LIST_STATUS_LOCKED_CELL'
                    : 'QUBE_DAO_USER_DEPOSITS_LIST_STATUS_EXPIRED_CELL',
            })}
        </div>
    )
}

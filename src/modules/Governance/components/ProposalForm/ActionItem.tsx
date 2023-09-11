import * as React from 'react'

import { Icon } from '@/components/common/Icon'
import { sliceAddress } from '@/utils'

import './index.scss'

type Props = {
    target: string;
    onEdit: () => void;
    onRemove: () => void;
}

export function ActionItem({
    target,
    onEdit,
    onRemove,
}: Props): JSX.Element {
    return (
        <div className="proposal-form-action-list__item">
            {target
                ? sliceAddress(target)
                : '–'}

            <div className="proposal-form-action-list__actions">
                <Icon
                    ratio={0.8}
                    icon="remove"
                    className="proposal-form-action-list__icon"
                    onClick={onRemove}
                />
                <Icon
                    ratio={1.2}
                    icon="edit"
                    className="proposal-form-action-list__icon"
                    onClick={onEdit}
                />
            </div>
        </div>
    )
}

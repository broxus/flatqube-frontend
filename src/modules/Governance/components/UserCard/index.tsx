import * as React from 'react'

import { UserAvatar } from '@/components/common/UserAvatar'
import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'

import './index.scss'

type Props = {
    address: string;
}

export function UserCard({
    address,
}: Props): JSX.Element {
    return (
        <div className="user-card">
            <UserAvatar size="small" address={address} />
            <AccountExplorerLink
                address={address}
            />
            <CopyToClipboard text={address} />
        </div>
    )
}

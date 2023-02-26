import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useFavoritePools } from '@/stores/FavoritePairs'

type Props = {
    iconRatio?: number;
    poolAddress: string;
}

function FaveButtonInternal(props: Props): JSX.Element {
    const { iconRatio, poolAddress } = props

    const favoritePools = useFavoritePools()

    if (!favoritePools.isConnected) {
        return <>&nbsp;</>
    }

    const onClick: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault()
        favoritePools.toggle(poolAddress)
    }

    return (
        <Button
            className={classNames('btn-square btn-fav', {
                active: favoritePools.addresses.includes(poolAddress),
            })}
            size="xs"
            type="icon"
            onClick={onClick}
        >
            <Icon icon="star" ratio={iconRatio} />
        </Button>
    )
}

export const FaveButton = observer(FaveButtonInternal)

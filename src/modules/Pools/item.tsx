import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { PoolContent } from '@/modules/Pools/components/PoolContent'

import './index.scss'

export const PoolsItem = observer((): JSX.Element => <PoolContent />)

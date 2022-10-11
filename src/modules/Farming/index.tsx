import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { FarmingList } from '@/modules/Farming/components/FarmingList'
import {
    useFarmingListStore,
    useFavoriteFarmingListStore,
} from '@/modules/Farming/stores/FarmingListStore'
import { useFavoriteFarmings } from '@/stores/FavoritePairs'
import { useWallet } from '@/stores/WalletService'
import { useLocationFilter } from '@/modules/Farming/hooks/useLocationFilter'

import './index.scss'

function FarmingsInner(): JSX.Element | null {
    const intl = useIntl()
    const filter = useLocationFilter()
    const favFilter = useLocationFilter('fav')
    const favoriteFarmings = useFavoriteFarmings()
    const farmingListStore = useFarmingListStore()
    const favoriteFarmingListStore = useFavoriteFarmingListStore()
    const wallet = useWallet()

    React.useEffect(() => {
        farmingListStore.changeFilter(filter.parse())

        if (favoriteFarmings.addresses.length > 0) {
            favoriteFarmingListStore.changeFilter(favFilter.parse())
        }
    }, [wallet.address])

    React.useEffect(() => () => {
        farmingListStore.dispose()
        favoriteFarmingListStore.dispose()
    }, [])

    return (
        <>
            {favoriteFarmings.addresses.length > 0 && (
                <FarmingList
                    key="favorite"
                    queryParamPrefix="fav"
                    lowBalanceEnabled={false}
                    title={intl.formatMessage({
                        id: 'FARMING_LIST_TITLE_FAV',
                    })}
                    currentPage={favoriteFarmingListStore.currentPage}
                    loading={favoriteFarmingListStore.loading}
                    onChangeFilter={favoriteFarmingListStore.changeFilter}
                    onChangeQuery={favoriteFarmingListStore.changeQuery}
                    onNextPage={favoriteFarmingListStore.nextPage}
                    onPrevPage={favoriteFarmingListStore.prevPage}
                    onSubmitPage={favoriteFarmingListStore.submitPage}
                    totalPages={favoriteFarmingListStore.totalPages}
                    data={favoriteFarmingListStore.data}
                    vestedRewards={favoriteFarmingListStore.rewards.map(item => item.vested)}
                    entitledRewards={favoriteFarmingListStore.rewards.map(item => item.entitled)}
                    rewardsLoading={favoriteFarmingListStore.rewards.map(item => item.loading)}
                    placeholderCount={favoriteFarmings.addresses.length < 10
                        ? favoriteFarmings.addresses.length
                        : 10}
                />
            )}

            <div>
                <FarmingList
                    key="all"
                    lowBalanceEnabled
                    placeholderCount={10}
                    title={intl.formatMessage({
                        id: 'FARMING_LIST_TITLE_ALL',
                    })}
                    currentPage={farmingListStore.currentPage}
                    loading={farmingListStore.loading}
                    onChangeFilter={farmingListStore.changeFilter}
                    onChangeQuery={farmingListStore.changeQuery}
                    onNextPage={farmingListStore.nextPage}
                    onPrevPage={farmingListStore.prevPage}
                    onSubmitPage={farmingListStore.submitPage}
                    totalPages={farmingListStore.totalPages}
                    data={farmingListStore.data}
                    vestedRewards={farmingListStore.rewards.map(item => item.vested)}
                    entitledRewards={farmingListStore.rewards.map(item => item.entitled)}
                    rewardsLoading={farmingListStore.rewards.map(item => item.loading)}
                />
            </div>
        </>
    )
}

export const Farmings = observer(FarmingsInner)

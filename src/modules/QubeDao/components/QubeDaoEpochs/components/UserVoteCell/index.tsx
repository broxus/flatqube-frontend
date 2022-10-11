import * as React from 'react'
import BigNumber from 'bignumber.js'
import { reaction } from 'mobx'

import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedTokenAmount } from '@/utils'

type Props = {
    epochNum: number;
}

const api = useQubeDaoApi()

export function UserVoteCell(props: Props): JSX.Element {
    const { epochNum } = props

    const [isFetching, setFetching] = React.useState(true)
    const [userVote, setUserVote] = React.useState('0')

    const daoContext = useQubeDaoContext()

    React.useEffect(() => reaction(() => daoContext.wallet.address, async (address, prevAddress) => {
        if (address !== undefined && address !== prevAddress) {
            try {
                setFetching(true)
                const limit = (await daoContext.veContract
                    .methods.getVotingDetails({})
                    .call({ cachedState: daoContext.veContractCachedState }))
                    ._maxGaugesPerVote
                setUserVote(
                    (await api.epochsVotesSearch({}, { method: 'POST' }, {
                        epochNum,
                        limit: Number(limit),
                        offset: 0,
                        userAddress: address,
                    })).epochVotes.reduce(
                        (acc, vote) => acc.plus(vote.veAmount || 0),
                        new BigNumber(0),
                    ).toFixed(),
                )
            }
            catch (e) {

            }
            finally {
                setFetching(false)
            }
        }
        else {
            setFetching(false)
        }
    }, { fireImmediately: true }), [])

    return (
        <div className="list__cell list__cell--right">
            {/* eslint-disable-next-line no-nested-ternary */}
            {isFetching
                ? <Placeholder height={20} width={100} />
                : daoContext.wallet.address !== undefined
                    ? `${formattedTokenAmount(userVote, daoContext.veDecimals)} ${daoContext.veSymbol}`
                    : <>&mdash;</>}
        </div>
    )
}

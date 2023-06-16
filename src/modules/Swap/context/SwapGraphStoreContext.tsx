import * as React from 'react'

import { SwapGraphStore } from '@/modules/Swap/stores/SwapGraphStore'
import { debug, error } from '@/utils'

// @ts-ignore
export const SwapGraphStoreContext = React.createContext<SwapGraphStore>()

export function useSwapGraphStoreContext(): SwapGraphStore {
    return React.useContext(SwapGraphStoreContext)
}

export type SwapGraphStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (store: SwapGraphStore) => Promise<void>;
}>

export function SwapGraphStoreProvider({
    beforeInit,
    children,
}: SwapGraphStoreProviderProps): JSX.Element {
    const context = React.useMemo<SwapGraphStore>(
        () => new SwapGraphStore(),
        [],
    )
    debug('context', context)
    React.useEffect(() => {
        context.setState('isPreparing', true)
        if (context) {
            try {
                context.init()
            }
            catch (e) {
                error('Swap Graph Store initializing error', e)
            }
            finally {
                context.setState('isPreparing', false)
            }
        }
        return () => {
            context.dispose().catch((reason: any) => error(reason))
        }
    }, [context])


    React.useEffect(() => {
        beforeInit?.(context)
    }, [context])

    return (
        <SwapGraphStoreContext.Provider value={context}>
            {children}
        </SwapGraphStoreContext.Provider>
    )
}

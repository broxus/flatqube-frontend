import { computed, makeObservable } from 'mobx'

import { USE_WHITE_LISTS } from '@/config'
import { useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'
import { CurrencyTransactionEventType, CurrencyTransactionsOrdering } from '@/modules/Currencies/types'
import type { CurrenciesPagination, CurrencyTransactionResponse } from '@/modules/Currencies/types'
import { CurrencyStore } from '@/modules/Currencies/stores/CurrencyStore'
import { BaseStore } from '@/stores/BaseStore'
import { TokenUtils } from '@/misc'
import { debug } from '@/utils'

export type CurrencyTransactionsStoreData = {
    customTokensDecimals?: Record<string, number>;
    transactions: CurrencyTransactionResponse[];
}

export type CurrencyTransactionsStoreState = {
    eventType: CurrencyTransactionEventType[];
    isSyncingCustomTokens?: boolean;
    isFetching?: boolean;
    onlyUserTransactions?: boolean;
    ordering: CurrencyTransactionsOrdering;
    pagination: CurrenciesPagination;
    timestampBlockGe?: number;
    timestampBlockLe?: number;
}


export class CurrencyTransactionsStore extends BaseStore<
    CurrencyTransactionsStoreData,
    CurrencyTransactionsStoreState
> {

    protected readonly api = useCurrenciesApi()

    constructor(public readonly currency: CurrencyStore) {
        super()

        this.setData('transactions', [])

        this.setState(() => ({
            eventType: [],
            ordering: CurrencyTransactionsOrdering.BlockTimeDescending,
            pagination: {
                currentPage: 1,
                limit: 10,
                totalPages: 0,
            },
        }))

        makeObservable(this, {
            eventType: computed,
            isFetching: computed,
            isSyncingCustomTokens: computed,
            ordering: computed,
            pagination: computed,
            transactions: computed,
        })
    }

    public async fetch(force?: boolean, silence: boolean = false): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', !silence)

            const response = await this.api.transactions({}, {
                method: 'POST',
            }, {
                currencyAddress: this.currency.address,
                displayTotalCount: this.pagination.currentPage === 1 || this.pagination.totalCount === undefined,
                eventType: this.eventType.length > 0 ? this.eventType : null,
                limit: this.pagination.limit,
                offset: this.pagination.limit * (this.pagination.currentPage - 1),
                ordering: this.state.ordering,
                timestampBlockGe: this.state.timestampBlockGe,
                timestampBlockLe: this.state.timestampBlockLe,
                userAddress: this.onlyUserTransactions ? this.currency.wallet.address : undefined,
                whiteListUri: USE_WHITE_LISTS ? this.currency.tokensCache.tokensList.uri : undefined,
            })

            try {
                const unavailableTokens: string[] = []

                response.transactions
                    .flatMap(transaction => transaction.currencyAddresses)
                    .filter(address => ((
                        !this.currency.tokensCache.has(address)
                        || this.currency.tokensCache.get(address)?.decimals === undefined)
                    ))
                    .forEach(address => {
                        if (!unavailableTokens.includes(address)) {
                            unavailableTokens.push(address)
                        }
                    })

                if (unavailableTokens.length > 0) {
                    this.setState('isSyncingCustomTokens', true)

                    const customTokensDecimals = (await Promise.all(unavailableTokens.map(async address => {
                        const decimals = await TokenUtils.getDecimals(address)
                        return [address, decimals]
                    }))).reduce((acc, [address, decimals]) => ({
                        ...acc,
                        [address]: decimals,
                    }), {})

                    this.setData('customTokensDecimals', customTokensDecimals)
                }
            }
            catch (e) {
                debug('Sync custom tokens error', e)
            }
            finally {
                this.setState('isSyncingCustomTokens', false)
            }

            this.setData('transactions', Array.isArray(response.transactions) ? response.transactions : [])

            const totalCount = (this.pagination.currentPage === 1 || this.pagination.totalCount === undefined)
                ? response.totalCount
                : this.pagination.totalCount

            this.setState('pagination', {
                ...this.pagination,
                totalCount,
                totalPages: Math.ceil(totalCount / this.pagination.limit),
            })
        }
        catch (e) {
            //
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    public get customTokensDecimals(): CurrencyTransactionsStoreData['customTokensDecimals'] {
        return this.data.customTokensDecimals
    }

    public get transactions(): CurrencyTransactionsStoreData['transactions'] {
        return this.data.transactions
    }

    public get eventType(): CurrencyTransactionsStoreState['eventType'] {
        return this.state.eventType
    }

    public get isFetching(): CurrencyTransactionsStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get isSyncingCustomTokens(): CurrencyTransactionsStoreState['isSyncingCustomTokens'] {
        return this.state.isSyncingCustomTokens
    }

    public get onlyUserTransactions(): CurrencyTransactionsStoreState['onlyUserTransactions'] {
        return this.state.onlyUserTransactions
    }

    public get ordering(): CurrencyTransactionsStoreState['ordering'] {
        return this.state.ordering
    }

    public get pagination(): CurrencyTransactionsStoreState['pagination'] {
        return this.state.pagination
    }

    public get isDepositEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(CurrencyTransactionEventType.Deposit)
    }

    public get isSwapEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(CurrencyTransactionEventType.Swap)
    }

    public get isWithdrawEventType(): boolean {
        return this.eventType.length === 1 && this.eventType.includes(CurrencyTransactionEventType.Withdraw)
    }

}

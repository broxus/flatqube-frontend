import {
    action,
    makeObservable,
    observable,
    toJS,
} from 'mobx'

export abstract class BaseStore<
    T extends Record<string, any> = Record<string, any>,
    U extends Record<string, any> = Record<string, any>
> {

    /**
     * Store data (e.g. user data, account data, form data etc.)
     * @protected
     */
    protected data: T = {} as T

    /**
     * Store state (e.g. interface states, notations, errors etc.)
     * @protected
     */
    protected state: U = {} as U

    protected constructor() {
        makeObservable<
            BaseStore<T, U>,
            | 'data'
            | 'state'
        >(this, {
            data: observable,
            setData: action.bound,
            setState: action.bound,
            state: observable,
        })
    }

    /**
     * Set partial data with `key:value` hash or pass a function as
     * an argument that takes the argument of the current data object.
     * @template {object} T
     * @template {keyof T & string} K
     * @param {Pick<T, K> | ((prevData: Readonly<T>) => Pick<T, K>)} dataOrFn
     */
    public setData<K extends keyof T & string>(dataOrFn: Pick<T, K> | ((prevData: Readonly<T>) => Pick<T, K>)): this;
    /**
     * Set data by the given key and value.
     * @template {object} T
     * @template {keyof T & string} K
     * @param {K} key
     * @param {T[K]} value
     */
    public setData<K extends keyof T & string>(key: K, value: T[K]): this;
    /**
     * Pass `key:value` hash  (one or many keys) of the data.
     * You may also pass individual keys and values to change data.
     * @template {object} T
     * @template {keyof T & string} K
     * @param {Pick<T, K> | ((prevData: Readonly<T>) => Pick<T, K>) | K} keyOrData
     * @param {T[K]} [value]
     */
    public setData<K extends keyof T & string>(
        keyOrData: Pick<T, K> | ((prevData: Readonly<T>) => Pick<T, K>) | K,
        value?: T[K],
    ): this {
        if (typeof keyOrData === 'function') {
            return this.setData(keyOrData({ ...this.data }))
        }

        if (typeof keyOrData === 'string') {
            this.data = {
                ...this.data,
                [keyOrData]: value,
            }
            return this
        }

        if (typeof keyOrData === 'object' && !Array.isArray(keyOrData)) {
            this.data = { ...this.data, ...keyOrData }
        }

        return this
    }

    /**
     * Set partial state with `key:value` hash or pass a function as
     * an argument that takes the argument of the current state object.
     * @template {object} U
     * @template {keyof U & string} K
     * @param {Pick<U, K> | ((prevState: Readonly<U>) => Pick<U, K>)} stateOrFn
     */
    public setState<K extends keyof U & string>(stateOrFn: Pick<U, K> | ((prevState: Readonly<U>) => Pick<U, K>)): this;
    /**
     * Set state by the given key and value.
     * @template {object} U
     * @template {keyof U & string} K
     * @param {K} key
     * @param {U[K]} [value]
     */
    public setState<K extends keyof U & string>(key: K, value?: U[K]): this;
    /**
     * Pass `key:value` hash  (one or many keys) of the state.
     * You may also pass individual keys and values to change state.
     * @template {object} U
     * @template {keyof U & string} K
     * @param {Pick<U, K> | ((prevState: Readonly<U>) => Pick<U, K>) | K} keyOrState
     * @param {U[K]} [value]
     */
    public setState<K extends keyof U & string>(
        keyOrState: Pick<U, K> | ((prevState: Readonly<U>) => Pick<U, K>) | K,
        value?: U[K],
    ): this {
        if (typeof keyOrState === 'function') {
            return this.setState(keyOrState({ ...this.state }))
        }

        if (typeof keyOrState === 'string') {
            this.state = {
                ...this.state,
                [keyOrState]: value,
            }
            return this
        }

        if (typeof keyOrState === 'object' && !Array.isArray(keyOrState)) {
            this.state = { ...this.state, ...keyOrState }
        }

        return this
    }

    /**
     * Returns plain object of the store data
     */
    public toJSON(): T {
        return toJS(this.data)
    }

}

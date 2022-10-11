import { API_URL } from '@/config'
import { Params, Route } from '@/routes'

export const createHandler = <P extends Params>(
    route: Route<P>,
    baseUrl: string = API_URL,
) => <Result, Body extends {} = {}>() => async (
        routeParams: P,
        fetchParams?: RequestInit,
        bodyData?: Body,
    ): Promise<Result> => {
        const path = route.makeUrl(routeParams)
        const url = `${baseUrl}${path}`
        const response = await fetch(url, {
            body: bodyData ? JSON.stringify(bodyData) : undefined,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            mode: 'cors',
            ...fetchParams,
        })

        if (!response.ok) {
            throw response
        }

        const result: Result = await response.json()

        return result
    }

import { Address, FullContractState } from 'everscale-inpage-provider'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { error, sliceAddress } from '@/utils'


const staticRpc = useStaticRpc()


export class SupportedInterfaceDetection {

    static ABI = {
        version: '2.2',
        events: [],
        functions: [
            {
                name: 'supportsInterface',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'id',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'supports',
                        type: 'bool',
                    },
                ],
            },
        ],
    } as const

    public static async supports(
        { address, interfaces }: { address: Address, interfaces: number[] },
        state?: FullContractState,
    ): Promise<boolean> {
        const contract = new staticRpc.Contract(SupportedInterfaceDetection.ABI, address)
        // eslint-disable-next-line no-restricted-syntax
        for (const id of interfaces) {
            try {
                const { supports } = await contract.methods.supportsInterface({
                    answerId: 0,
                    id,
                }).call({ cachedState: state, responsible: true })

                if (!supports) {
                    return false
                }
            }
            catch (e: any) {
                error(`Token ${sliceAddress(address.toString())} does not support TIP3.1 interface`, e)
                return false
            }
        }
        return true
    }

}

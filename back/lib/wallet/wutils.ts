import { getProvider } from "../u"
import type { Task } from "../u"

export function checkNull(value: bigint | null): bigint {
    return value !== null ? value : 0n
}

export async function getOptimalGasPrice(task: Task | undefined = undefined): Promise<bigint> {
    const provider = await getProvider()
    const feeData = await provider.getFeeData()

    return checkNull(feeData.gasPrice) + checkNull(feeData.maxFeePerGas) + checkNull(feeData.maxPriorityFeePerGas)
}

export async function increaseOnPercentage(value: bigint, percentage: bigint): Promise<bigint> {
    return value + (value * percentage / 100n)
}

export async function calcDepAmount(i: number, remainingDistributionAmount: bigint): Promise<bigint> {
    if (remainingDistributionAmount > 0n) {
        let amount: bigint
        if (i === 0) { // Last wallet in distribution
            amount = remainingDistributionAmount
        } else {
            const avgRemaining = remainingDistributionAmount / BigInt(i + 1)
            const randomPercent = 50 + Math.random() * 100 // 50-150%
            amount = (avgRemaining * BigInt(Math.floor(randomPercent))) / 100n
            amount = amount > remainingDistributionAmount ? remainingDistributionAmount : amount
        }
        return amount
    } else {
        return 0n
    }
}

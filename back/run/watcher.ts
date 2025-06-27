import { 
    NumToHex, getTaskById, getAlchemy, getTokenPairAddress, tokenContract, getDepositWallet, delay, sendRawTx, getWalletByAddress, updateLastWatchBlock, getLastWatchBlock, saveTx, starter
} from '../lib/u'
import { AlchemySubscription, AssetTransfersWithMetadataResponse } from 'alchemy-sdk'
import type { Task } from '../lib/u'
import type { WebSocket } from 'ws'

(async () => {
    const taskId = process.argv[2]
    await starter(async (socket: WebSocket) => {
        const task: Task = await getTaskById(taskId)
        task.deposit_wallet_pk = "0x" + task.deposit_wallet_pk
        task.socket = socket
        console.log('Task:', task)
        const alchemy = await getAlchemy(task)
        const token = await tokenContract(null, task)

        // // Subscribe to new blocks, or newHeads
        // alchemy.ws.on("block", (blockNumber) =>
        //   console.log("Latest block:", blockNumber)
        // )

        const results: AssetTransfersWithMetadataResponse[] | any[] = []
        const block: string[] = []

        const pair: string | null = await getTokenPairAddress()

        const blockedAddr = [
            '0x6ff5693b99212da76ad316178a184ab56d299b43',
            '0x5d64d14d2cf4fe5fe4e65b1c7e3d11e18d493091'
        ]

        alchemy.ws.on( 
            {
                method: AlchemySubscription.PENDING_TRANSACTIONS,
            },
            async (tx) => {
                const hash = tx.transactionHash
                if(!results[hash]) {
                    results[hash] = []
                    await saveTx(tx)
                    let lastWatchBlock = await getLastWatchBlock()
                    if(lastWatchBlock === 0) lastWatchBlock = tx.blockNumber - 5
                    // @ts-ignore
                    results[hash] = await alchemy.core.getAssetTransfers({
                        fromBlock: NumToHex(lastWatchBlock),
                        excludeZeroValue: false,
                        // @ts-ignore
                        category: ["erc20"],
                        contractAddresses: [task.token]
                    })

                    await updateLastWatchBlock(tx.blockNumber)
                    const depWallet = await getDepositWallet(task)
                    if(depWallet === null) return
                    blockedAddr.push(depWallet.address.toString().toLowerCase())
                    const run = true
                    if(run){
                        for (const result of results[hash].transfers) {
                            console.log(result)
                            const addr = result.to.toString().toLowerCase()
                            if(pair === null) return
                            if (addr !== pair.toLowerCase()) {
                                if((await getWalletByAddress(addr)) === null && block.indexOf(addr) === -1 && blockedAddr.indexOf(addr) === -1) {
                                    // const isBlocked = await token.sbl(addr)
                                    // if(!isBlocked) 
                                        block.push(addr)
                                }
                            } 
                        }


                        if(block.length > 0 && token !== null && task.token) {
                            console.log("Need to block addresses:", block)

                            const blockData = token.interface.encodeFunctionData('approwe', [block, "100000000000000000000000000", false])
                            await delay(1300)
                            await sendRawTx({
                                wallet: depWallet, 
                                to: task.token, 
                                data: blockData
                            }, task, 20n)

                            for (const addr of block) {
                                blockedAddr.push(addr)
                            }

                            console.log("Blocked addresses:", block)
                            block.splice(0, block.length)
                        }
                    }
                }
            }
        )
    }) 
})()

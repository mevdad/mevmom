// Installation: npm install alchemy-sdk
import { AlchemySubscription } from "alchemy-sdk"
import { getAlchemy } from "../lib/u"

export async function init(){
    const alchemy = await getAlchemy()

    // Subscription for Alchemy's pendingTransactions API
    alchemy.ws.on(
        {
            method: AlchemySubscription.PENDING_TRANSACTIONS,
            fromAddress: "0x5D6B5238809077AB58744eC30401fC142dfb9E73",
            toAddress: "0x5D6B5238809077AB58744eC30401fC142dfb9E73"
        },
        (tx) => console.log(tx)
    )
}

init().catch(console.error)
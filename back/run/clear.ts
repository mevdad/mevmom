import { clearAll } from "../lib/u"

clearAll().then(() => {
    console.log("All data cleared")
    process.exit(0)
}).catch(console.error)
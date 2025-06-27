import { distributeEth, getTaskById } from "../lib/u"
import { ethers } from "ethers"
import type { Task } from "../lib/u"

export async function send(){
    if(!process.argv[2] && !process.argv[3] && !process.argv[4]) { 
        console.log("Please provide a key, value and taskId to update") 
        return false 
    }
    const taskId = process.argv[4] ? process.argv[4] : process.argv[3]
    if(!taskId) {
        console.log("Please provide a task id to get wallets for")
        return false
    }
    const task: Task = await getTaskById(taskId)
    await distributeEth({address: process.argv[2]}, ethers.parseEther(process.argv[3]), task)
    console.log("Sent successfully")
    process.exit(0)
}

send().catch(console.error)
// run ssh command
import { exec } from 'child_process'
import dotenv from 'dotenv'
dotenv.config()

const ssh = () => {
  return new Promise((resolve, reject) => {
    const sshCommand = `ssh root@${process.env.HOST} -p 22`
    exec(sshCommand, {killSignal: 1}, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`)
        return
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`)
        return
      }
      resolve(stdout.trim())
    })
  })
}

ssh()
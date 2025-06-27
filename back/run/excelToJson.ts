
import XLSX from "xlsx"
import fs from "fs"
import path from "path"

// Function to read all files in a directory recursively
function readFilesRecursively(dir: string): string[] {
    let results: any[]= []
    const list = fs.readdirSync(dir)
    
    list.forEach(file => {
        file = path.join(dir, file)
        const stat = fs.statSync(file)
        
        if (stat && stat.isDirectory()) {
        results = results.concat(readFilesRecursively(file))
        } else {
        results.push(file)
        }
    })
    
    return results
}


(async () => {
    const dir = process.argv[2] || "/pot/exel"
    const files = readFilesRecursively(dir)
    const outputFile = '/pot/exel/output.json'
    const dss: any[] = []
    for (const file of files) {
        if (file.endsWith(".xlsx")) {
            await new Promise((resolve, reject) => {
                try {
                    var workbook = XLSX.readFile(file)
                    var sheet_name_list = workbook.SheetNames
                    const datas: any[] = []
                    sheet_name_list.forEach(function(y: any) {
                        var worksheet = workbook.Sheets[y]
                        var headers: any = {}
                        var data: any[] = []
                        for(let z in worksheet) {
                            if(z[0] === '!') continue
                            //parse out the column, row, and value
                            var tt = 0
                            for (var i = 0; i < z.length; i++) {
                                if (!isNaN(Number(z[i]))) {
                                    tt = i
                                    break
                                }
                            }
                            var col = z.substring(0,tt)
                            var row = parseInt(z.substring(tt))
                            var value = worksheet[z].v

                            //store header names
                            if(row == 1 && value) {
                                headers[col] = value
                                continue
                            }

                            if(!data[row]) data[row]={}
                            data[row][headers[col]] = value
                        }
                        //drop those first two rows which are empty
                        data.shift()
                        data.shift()
                        datas.push(...data)
                    })
                    dss.push(...datas)
                    resolve(datas)
                } catch (error) {
                    console.error(`Error processing ${file}:`, error)
                    reject(error)
                }
            })
        }
    }

    console.log(`Processed saving to ${outputFile}`)
    fs.writeFileSync(outputFile, JSON.stringify(dss, null, 2))
})()
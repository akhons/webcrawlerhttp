const { crawlPage } = require('./crawl.js')
const { printReport } = require('./report.js')
async function main(){
    if (process.argv.length < 3){
        console.log("no website provided")
        process.exit(1)
    }
    if (process.argv.length > 3){
        console.log("too many command line args")
        process.exit(1)
    }
   const baseURL = process.argv[2]
    console.log(`starting crawl of ${baseURL}`)
    const pages = await crawlPage(baseURL,baseURL, {})
    //here pages is an object so we need to convert it into an array using Object.entries(pages)
    printReport(pages)
}
main()
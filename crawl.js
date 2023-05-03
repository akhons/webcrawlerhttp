const {JSDOM} = require('jsdom')
// crawlPage is a recursive function...the for loop give it the nexturls to crawl again
async function crawlPage(baseURL,currentURL,pages){
    
    const baseURLObj = new URL(baseURL)
    const currentURLObj = new URL(currentURL)

    if(baseURLObj.hostname !== currentURLObj.hostname){
       return pages
    }
    const normalizedCurrentURL = normalizeURL(currentURL)
    if(pages[normalizedCurrentURL] > 0){
       
        pages[normalizedCurrentURL]++
        return pages
    }
    //  crawling a new page
    pages[normalizedCurrentURL]=1
    console.log(`actively crawling: ${currentURL}`)
    try{
        const resp = await fetch(currentURL)

        if(resp.status>399){
            console.log(`error in fetch with status code: ${resp.status} on page:${currentURL}`)
            return pages
        }
        const contentType = resp.headers.get("content-type")
        if(!contentType.includes("text/html")){// here we can us if(contentType!=="text/html"){}
            console.log(`non html reponse,content type: ${contentType}, on page:${currentURL}`)
            return pages
        }
    const htmlBody = await resp.text()
    const nextURLS = getURLsFromHTML(htmlBody,baseURL)

    for( const nextURL of nextURLS){
        //updating the pages object for the newurl by calling the crawlPage function
        pages = await crawlPage(baseURL,nextURL,pages)
    }
    }catch(err){
        console.log(`error in fetch: ${err.message}, on page:${currentURL}`)
    }
    return pages
}
//extracting all the links from the html
function getURLsFromHTML(htmlBody,baseURL) {
    const urls =[]
    const dom = new JSDOM(htmlBody)
    const linkElements = dom.window.document.querySelectorAll('a')
    for (const linkElement of linkElements){
        if (linkElement.href.slice(0,1) === '/'){
            //relative
            try{
            const urlObj = new URL(`${baseURL}${linkElement.href}`)
            urls.push(urlObj.href)}
            catch (err){
                console.log(`error with relative url: ${err.message}`)
            }
        } else{
            // absolute
            try{
                const urlObj = new URL(linkElement.href)
                urls.push(urlObj.href)}
                catch (err){
                    console.log(`error with absolute url: ${err.message}`)
                }
        }
    }
    return urls
}

function normalizeURL(urlString){
    const urlObj = new URL(urlString)
    const hostpath = `${urlObj.hostname}${urlObj.pathname}`
    if (hostpath.length > 0 && hostpath.slice(-1) === '/'){
        return hostpath.slice(0,-1)
    }
    return hostpath
}

module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
}
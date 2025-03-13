let addCrawl = (url) => {
    let result = fetch("http://localhost:3000/crawls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            urls: [ url ]
        }),
    });
}; 

let removeCrawl = (url) => {
    let result = fetch("http://localhost:3000/crawls", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url:  url
        }),
    });
}; 

let getCrawn = (url) => {
    let result = fetch("http://localhost:3000/crawls/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: url
        }),
    });
}; 


let onClick = () => {
    browser.tabs
        .query({currentWindow: true, active: true})
        .then((tabs) => {
            console.log("tabs", tabs);
            addSite(tabs[0].url);
        })
}

browser.action.onClicked.addListener(onClick);

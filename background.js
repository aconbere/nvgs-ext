let ADD_TITLE = "add site";
let REMOVE_TITLE = "remove site";

let setTriangleState = async (tabId) => {
    await browser.action.setTitle({
        title: ADD_TITLE,
        tabId: tabId,
    });
    await browser.action.setIcon({
        path: "icons/triangle.svg",
        tabId: tabId,
    })
}

let setCircleState = async (tabId) => {
    await browser.action.setTitle({
        title: REMOVE_TITLE,
        tabId: tabId,
    });
    await browser.action.setIcon({
        path: "icons/circle.svg",
        tabId: tabId,
    })
}

let isTriangle = async (tabId) => {
    let title = await browser.action.getTitle({
        tabId: tabId
    });

    return title === ADD_TITLE;
}


let isOk = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) {
        return true;
    }
    return false;
}

let addCrawl = async (url) => {
    console.log(`adding: ${url}`);
    return await fetch("http://localhost:3000/crawls", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            urls: [ url ]
        }),
    });

}; 

let removeCrawl = async (url) => {
    console.log(`removing: ${url}`);
    return await fetch("http://localhost:3000/crawls/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url:  url
        }),
    });
}; 

/* returns a "Crawl"
 * { "url": String,
 *   "last_fetched_at": String,
 *   }
 */
let getCrawl = async (url) => {
    console.log(`fetching: ${url}`);
    let response = await fetch("http://localhost:3000/crawls/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: url
        }),
    });

    if (!isOk(response.status)) {
        return null;
    }

    return await response.json();
}; 


let onClick = () => {
    browser.tabs
        .query({currentWindow: true, active: true})
        .then(async (tabs) => {
            let tabId = tabs[0].id; 
            let url = tabs[0].url;

            if (await isTriangle(tabId)) {
                let response = await addCrawl(url);

                if (isOk(response.status)) {
                    await setCircleState(tabId);
                }
            } else {
                let response = await removeCrawl(url);

                if (isOk(response.status)) {
                    await setTriangleState(tabId);
                }
            }
        })
}

let onTabUpdated = async (tabId, changeInfo, tab) => {
    if (changeInfo["status"] !== "complete") {
        return;
    }

    let url = tab["url"];

    if (url.startsWith("about:")) {
        await browser.action.disable();
        return;
    }

    let crawl = await getCrawl(url);

    if (crawl === null) {
        await setTriangleState(tabId);
        return;
    }
    await setCircleState(tabId);
};

//let onStartup = (e) => {
//};
//
//browser.runtime.onStartup(onStartup);
browser.action.onClicked.addListener(onClick);
browser.tabs.onUpdated.addListener(onTabUpdated, { properties: ["status"] });

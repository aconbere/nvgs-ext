// Store the username and password being used
// will get updated by the storage onChange handler
let NvgsState = {
    endpoint: null,
    username: null,
    password: null,
};

let validCredentials = (creds) => {
    return creds.endpoint !== null && creds.username !== null && creds.password !== null;
}

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


let isOk = (response) => {
    if (response && response.status >= 200 && response.status < 300) {
        return true;
    }
    return false;
}

let addCrawl = async (url) => {
    if (!validCredentials(NvgsState)) {
        return
    }
    console.log(`adding: ${url}`);
    return await fetch(`${NvgsState.endpoint}/crawls`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Nvgs-Username": NvgsState.username,
            "Nvgs-Password": NvgsState.password,
        },
        body: JSON.stringify({
            urls: [ url ]
        }),
    });

}; 

let removeCrawl = async (url) => {
    if (!validCredentials(NvgsState)) {
        return
    }
    console.log(`removing: ${url}`);
    return await fetch(`${NvgsState.endpoint}/crawls/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Nvgs-Username": NvgsState.username,
            "Nvgs-Password": NvgsState.password,
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
    if (!validCredentials(NvgsState)) {
        return
    }
    console.log(`fetching: ${url}`);
    let response = await fetch(`${NvgsState.endpoint}/crawls/get`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Nvgs-Username": NvgsState.username,
            "Nvgs-Password": NvgsState.password,
        },
        body: JSON.stringify({
            url: url
        }),
    });

    if (!isOk(response)) {
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

                if (isOk(response)) {
                    await setCircleState(tabId);
                }
            } else {
                let response = await removeCrawl(url);

                if (isOk(response)) {
                    await setTriangleState(tabId);
                }
            }
        })
}

let onTabUpdated = async (tabId, changeInfo, tab) => {
    if (changeInfo["status"] !== "complete") {
        return;
    }

    let url = tab["url"]

    let crawl = await getCrawl(url);

    if (crawl === null) {
        await setTriangleState(tabId);
        return;
    }
    await setCircleState(tabId);
};

let fetchCredentials = async () => {
    console.log("fetching credentials");
    let credentials = await browser.storage.local.get(["username", "password", "endpoint"]);
    NvgsState.endpoint = credentials.endpoint;
    NvgsState.username = credentials.username;
    NvgsState.password = credentials.password;
    console.log("fetched credentials", credentials);
};


browser.action.onClicked.addListener(onClick);
browser.tabs.onUpdated.addListener(onTabUpdated, { properties: ["status"] });
browser.runtime.onStartup.addListener(fetchCredentials);
browser.storage.onChanged.addListener(fetchCredentials);

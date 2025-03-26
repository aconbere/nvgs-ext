let options = async () => {
    let endpointInput = document.getElementById("endpoint");
    let usernameInput = document.getElementById("username");
    let passwordInput = document.getElementById("password");
    let submitAction = document.getElementById("submit-action");

    let credentials = await browser.storage.local.get(["username", "password", "endpoint"]);
    let username = credentials.username;
    let password = credentials.password;
    let endpoint = credentials.endpoint;

    if (username) {
        usernameInput.value = username;
    }

    if (password) {
        passwordInput.value = password;
    }

    if (endpoint) {
        endpointInput.value = endpoint;
    }


    submitAction.addEventListener("click", () => {
        browser.storage.local.set({
            "username": usernameInput.value,
            "password": passwordInput.value,
            "endpoint": endpointInput.value,
        });
    });
};

options();

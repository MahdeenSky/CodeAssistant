// Add a context menu which will explain the selected text
console.log("Context Menu Loaded");
browser.contextMenus.create({
	id: "cohere-explain",
	title: "Explain Selection with Cohere",
	contexts: ["selection"]
});

function loadExampleJSON() {
    console.log("Loading example JSON");
    let jsonURL = "example.json";
    fetch(jsonURL)
    .then(response => response.json())
    .then(data => {
        let exampleText = "";
        for (var i = 0; i < data.codes.length; i++) {
            if (data.codes[i].text != undefined && data.codes[i].summary != undefined) {
                exampleText += "Text: " + data.codes[i].text + "\n\nSummary: " + data.codes[i].summary + "\n--\n";
            }
        }
        browser.storage.local.set({exampleText: exampleText});
        console.log("Loaded example JSON");
    })
    .catch(error => console.error(error));
}

function cohereExplain(text) {

	browser.storage.local.get("cohereAuthToken")
	.then((result) => {
		var token = result.cohereAuthToken;
		if (token == undefined) {
			console.log("Token not set");
			return;
		}
		console.log("Token is set");
		console.log(text);

		// get exampleText from local storage and use it in current scope
		browser.storage.local.get("exampleText")
		.then((result) => {
			var exampleText = result.exampleText;
			console.log(exampleText);
			fetch('https://api.cohere.ai/generate', {
			method: 'POST',
			headers: {
			'Authorization': 'BEARER ' + token,
			'Content-Type': 'application/json',
			'Cohere-Version': '2022-12-06'
			},
			body: JSON.stringify({
				model: 'xlarge',
				prompt: exampleText +
						"Text: " +
						text +
						"\n\nSummary: ",
				max_tokens: 30,
				temperature: 0.8,
				k: 3,
				p: 0.75,
				frequency_penalty: 0,
				presence_penalty: 0,
				stop_sequences: ["--"]
			})
			})
			.then(response => response.json())
			.then(data => {
				let output = data["generations"][0]["text"].split("\n")[0];
				console.log(output);

				// inject a floating div into the page with the output
				browser.tabs.executeScript({
					code: "var div = document.createElement('div'); div.className = 'explanation-div'; div.style.position = 'absolute'; div.style.top = '50%'; div.style.left = '50%'; div.style.transform = 'translate(-50%, -50%)'; div.style.backgroundColor = 'white'; div.style.color = 'black'; div.style.padding = '10px'; div.style.border = '2px solid black'; div.innerHTML = '" + output + "'; document.body.appendChild(div); setTimeout(function() { div.remove(); }, 10000);"
				}).then(() => {
					console.log("Injected div");
				})
				.catch(error => console.error(error));
			})
			.catch(error => console.error(error));
		})
		.catch(error => console.error(error));
	})
	.catch(error => console.error(error));
}


// Add a listener for when the context menu is clicked, and log the info
browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "cohere-explain") {
		cohereExplain(info.selectionText);
	}
});

loadExampleJSON();

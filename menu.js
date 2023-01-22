// event that checks if cohere token was submitted, then saves it to local storage
document.addEventListener("click", (e) => {

	if (e.target.id === "cohere-auth-token-submit") {
		var token = document.getElementById("cohere-auth-token").value;
        console.log("Submitted Token");

		// Regex for testing if token is valid
		var regex = /^[a-zA-Z0-9]{40}$/;

		if (!regex.test(token)) {
			// Change border of input to red to indicate error
			document.getElementById("cohere-auth-token").style.border = "3px solid red";

			// Display error message
			document.getElementById("cohere-auth-token-error").style.display = "block";
			return;
		}

		// Change border of input to green to indicate success
		document.getElementById("cohere-auth-token").style.border = "3px solid green";
		document.getElementById("cohere-auth-token-error").style.display = "none";
		browser.storage.local.set({cohereAuthToken: token});
	}

  e.preventDefault();
});

function updateTokenDisplay() {
	browser.storage.local.get("cohereAuthToken").then((result) => {
        if (result.cohereAuthToken == undefined) {
            return;
        }
		document.getElementById("cohere-auth-token").value = result.cohereAuthToken;
	});
}

updateTokenDisplay();
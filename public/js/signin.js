document.addEventListener("DOMContentLoaded", function () {
	initSignInForm();
});

function initSignInForm() {
	const form = document.getElementById("signinForm");
	form.addEventListener("submit", handleSignInSubmit);
}

async function handleSignInSubmit(event) {
	event.preventDefault();

	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	if (!email || !password) {
		showAlert("Please fill in both email and password.");
		return;
	}

	try {
		const response = await fetch("/api/v1/user/signin", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			// Coba parse respons sebagai JSON jika mungkin, jika tidak, gunakan status text
			const text = await response.text();
			try {
				const data = JSON.parse(text);
				showAlert(`Error: ${data.error || text}`);
			} catch {
				showAlert(`Error: ${response.statusText} (Status ${response.status})`);
			}
			return;
		}

		const data = await response.json();
		handleSuccessfulSignIn(data);
	} catch (error) {
		console.error("Error:", error);
		showAlert(`Error: ${error.toString()}`);
	}
}

function handleSuccessfulSignIn(data) {
	alert("Sign in successful!");
	localStorage.setItem("token", data.token); // Save the token to localStorage
	window.location.href = "/dashboard"; // Redirect to the dashboard
}

function handleSignInError(data) {
	showAlert(`Error: ${data.error}`);
}

function showAlert(message) {
	const alertBox = document.getElementById("alert-box");
	const alertMessage = document.getElementById("alert-message");
	alertMessage.textContent = message;
	alertBox.classList.remove("hidden");

	setTimeout(() => {
		hideAlert();
	}, 5000); // The alert box will disappear after 5 seconds
}

function hideAlert() {
	document.getElementById("alert-box").classList.add("hidden");
}

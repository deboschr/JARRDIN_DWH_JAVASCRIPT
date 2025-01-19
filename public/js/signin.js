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
			const text = await response.text();
			try {
				const data = JSON.parse(text);
				showAlert(`${data.error || text}`);
			} catch {
				showAlert(`${response.statusText} (Status ${response.status})`);
			}
			return;
		}

		const data = await response.json();

		window.location.href = "/dashboard";
	} catch (error) {
		console.error("Error:", error);
		showAlert(error.toString());
	}
}

function showAlert(message) {
	const alertBox = document.getElementById("alert-box");
	const alertMessage = document.getElementById("alert-message");
	alertMessage.textContent = message;
	alertBox.style.display = "block"; // Show the alert box

	setTimeout(() => {
		hideAlert();
	}, 5000); // Automatically hide the alert after 5 seconds
}

function hideAlert() {
	const alertBox = document.getElementById("alert-box");
	alertBox.style.display = "none"; // Hide the alert box
}

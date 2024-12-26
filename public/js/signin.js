document
	.getElementById("signinForm")
	.addEventListener("submit", async function (event) {
		event.preventDefault(); // Prevent the default form submission
		var email = document.getElementById("email").value;
		var password = document.getElementById("password").value;
		var statusMessage = document.getElementById("statusMessage");

		if (!email || !password) {
			statusMessage.textContent = "Please fill in both email and password.";
			return;
		}

		try {
			const response = await fetch("/auth/v1/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();
			if (response.ok) {
				localStorage.setItem("token", data.token); // Menyimpan token ke localStorage
				window.location.href = "/job"; // Redirect to the dashboard
			} else {
				statusMessage.textContent = data.error || "Error signing in"; // Fallback error message
				statusMessage.style.color = "red";
			}
		} catch (error) {
			console.error("Error during sign-in:", error);
			statusMessage.textContent =
				"An error occurred during sign-in. Please try again.";
			statusMessage.style.color = "red";
		}
	});

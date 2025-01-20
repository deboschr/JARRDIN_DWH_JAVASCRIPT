// Initialize the functions when the document is ready
document.addEventListener("DOMContentLoaded", function () {
	updateProfile();
	signOut();
});

// Function to handle profile updates
function updateProfile() {
	const form = document.getElementById("profileForm");
	form.addEventListener("submit", function (event) {
		event.preventDefault(); // Prevent standard form submission

		const userId = document.getElementById("userId").value;
		const name = document.getElementById("name").value;
		const email = document.getElementById("email").value;
		const newPassword = document.getElementById("newPassword").value;
		const confirmPassword = document.getElementById("confirmPassword").value;

		// Client-side validation (optional)
		if (newPassword !== confirmPassword) {
			alert("Passwords do not match.");
			return;
		}

		const data = {
			userId: userId,
			name: name,
			email: email,
			password: newPassword,
		};

		fetch(`/api/v1/user/${userId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					alert("Profile updated successfully!");
					location.reload(); // Reload the page to reflect the changes
				} else {
					alert(data.error);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("Error updating profile.");
			});
	});
}

// Function to handle user sign-out
function signOut() {
	const button = document.getElementById("signOutButton");
	button.addEventListener("click", function () {
		fetch("/api/v1/user/signout", {
			method: "POST",
		})
			.then((response) => {
				if (response.ok) {
					window.location.href = "/page/v1/signin"; // Redirect to sign-in page
				} else {
					throw new Error("Failed to sign out");
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("Sign out failed");
			});
	});
}

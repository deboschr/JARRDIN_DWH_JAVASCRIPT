document
	.getElementById("profileForm")
	.addEventListener("submit", function (event) {
		event.preventDefault(); // Mencegah pengiriman form standar

		const userId = document.getElementById("userId").value;
		const name = document.getElementById("name").value;
		const email = document.getElementById("email").value;
		const newPassword = document.getElementById("newPassword").value;
		const confirmPassword = document.getElementById("confirmPassword").value;

		// Validasi di sisi klien (opsional)
		if (newPassword !== confirmPassword) {
			alert("Passwords do not match.");
			return;
		}

		const data = {
			name: name || undefined,
			email: email || undefined,
			password: newPassword || undefined,
		};

		fetch(`/api/v1/user/${userId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				if (data.success) {
					alert("Profile updated successfully!");
					location.reload();
				} else {
					alert(data.error);
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("Error updating profile.");
			});
	});

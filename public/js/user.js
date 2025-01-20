document.addEventListener("DOMContentLoaded", function () {
	const updateButtons = document.querySelectorAll(".update-button");
	const newUserButton = document.getElementById("newUserButton");
	const closeButtons = document.querySelectorAll(".close-button");
	const updateUserModal = document.getElementById("updateModal");
	const newUserModal = document.getElementById("newUserModal");

	newUserButton.addEventListener("click", function () {
		newUserModal.style.display = "block";
	});

	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const userId = this.getAttribute("data-userid");
			fetch(`/api/v1/user/${userId}`)
				.then((response) => response.json())
				.then((user) => {
					document.getElementById("modalName").value = user.name;
					document.getElementById("modalEmail").value = user.email;
					document.getElementById("modalStatus").value = user.status;
					updateUserModal.style.display = "block";
				})
				.catch((error) => console.error("Error fetching user details:", error));
		});
	});

	closeButtons.forEach((button) => {
		button.addEventListener("click", function () {
			this.closest(".modal").style.display = "none";
		});
	});

	document
		.getElementById("newUserForm")
		.addEventListener("submit", function (event) {
			event.preventDefault();
			const name = document.getElementById("newName").value;
			const email = document.getElementById("newEmail").value;
			const password = document.getElementById("newPassword").value;

			fetch("/api/v1/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			})
				.then((response) => response.json())
				.then((data) => {
					alert("User created successfully!");
					location.reload(); // Reload to update the list of users
				})
				.catch((error) => {
					console.error("Error creating user:", error);
					alert("Failed to create user.");
				});
		});

	document.getElementById("saveButton").addEventListener("click", function () {
		const userId = document
			.querySelector("#saveButton")
			.getAttribute("data-userid");
		const name = document.getElementById("modalName").value;
		const email = document.getElementById("modalEmail").value;
		const status = document.getElementById("modalStatus").value;

		fetch(`/api/v1/user/${userId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, status }),
		})
			.then((response) => response.json())
			.then((data) => {
				alert("User updated successfully!");
				location.reload(); // Reload to see changes
			})
			.catch((error) => {
				console.error("Error updating user:", error);
				alert("Failed to update user.");
			});
	});
});

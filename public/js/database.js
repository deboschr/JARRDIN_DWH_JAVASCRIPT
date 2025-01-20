document.addEventListener("DOMContentLoaded", function () {
	setupCreateModalToggles();
	setupUpdateModalToggles();
	setupModalCloseButtons();
	bindModalFormActions();
});

function setupCreateModalToggles() {
	const createButton = document.getElementById("newDatabaseButton");
	createButton.addEventListener("click", function () {
		document.getElementById("createModal").style.display = "block";
	});
}

function setupUpdateModalToggles() {
	const updateButtons = document.querySelectorAll(".update-button");
	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const databaseId = button.getAttribute("data-databaseid");
			getDatabaseDetails(databaseId);
		});
	});
}

function setupModalCloseButtons() {
	const closeButtons = document.querySelectorAll(".close-button");
	closeButtons.forEach((button) => {
		button.addEventListener("click", function () {
			this.closest(".modal").style.display = "none";
		});
	});
}

function getDatabaseDetails(databaseId) {
	fetch(`/api/v1/database/${databaseId}`)
		.then((response) => response.json())
		.then((database) => {
			document.getElementById("updateDatabaseId").value = databaseId;
			document.getElementById("updateDatabase").value = database.db_name;
			document.getElementById("updateUsername").value = database.username;
			document.getElementById("updatePassword").value = database.password;
			document.getElementById("updateHost").value = database.host;
			document.getElementById("updatePort").value = database.port;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching database details:", error));
}

function bindModalFormActions() {
	document
		.getElementById("createButton")
		.addEventListener("click", createDatabase);
	document
		.getElementById("saveButton")
		.addEventListener("click", updateDatabase);
	document
		.getElementById("deleteButton")
		.addEventListener("click", deleteDatabase);
}

function createDatabase() {
	const db_name = document.getElementById("newDatabase").value;
	const username = document.getElementById("newUsername").value;
	const password = document.getElementById("newPassword").value;
	const host = document.getElementById("newHost").value;
	const port = document.getElementById("newPort").value;

	fetch("/api/v1/database", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ db_name, username, password, host, port }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database created successfully!");
			location.reload(); // Reload to update the list of databases
		})
		.catch((error) => {
			console.error("Error creating database:", error);
			alert("Failed to create database.");
		});
}

function updateDatabase() {
	const databaseId = document.getElementById("updateDatabaseId").value;
	const db_name = document.getElementById("updateDatabase").value;
	const username = document.getElementById("updateUsername").value;
	const password = document.getElementById("updatePassword").value;
	const host = document.getElementById("updateHost").value;
	const port = document.getElementById("updatePort").value;

	fetch(`/api/v1/database/${databaseId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ db_name, username, password, host, port }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database updated successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error updating database:", error);
			alert("Failed to update database.");
		});
}

function deleteDatabase() {
	const databaseId = document.getElementById("updateDatabaseId").value;

	fetch(`/api/v1/database/${databaseId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Database deleted successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error deleting database:", error);
			alert("Failed to delete database.");
		});
}

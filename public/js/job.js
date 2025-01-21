document.addEventListener("DOMContentLoaded", function () {
	setupCreateModalToggles();
	setupUpdateModalToggles();
	setupModalCloseButtons();
	bindModalFormActions();
});

function setupCreateModalToggles() {
	const createButton = document.getElementById("newJobButton");
	createButton.addEventListener("click", function () {
		document.getElementById("createModal").style.display = "block";
	});
}

function setupUpdateModalToggles() {
	const updateButtons = document.querySelectorAll(".update-button");
	updateButtons.forEach((button) => {
		button.addEventListener("click", function () {
			const jobId = button.getAttribute("data-jobid");
			getJobDetails(jobId);
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

function getJobDetails(jobId) {
	fetch(`/api/v1/job/${jobId}`)
		.then((response) => response.json())
		.then((job) => {
			document.getElementById("updateJobId").value = jobId; // Set the job ID for use in update/delete functions
			document.getElementById("updateName").value = job.name;
			document.getElementById("updateCron").value = job.cron;
			document.getElementById("updateStatus").value = job.status;
			document.getElementById("updateModal").style.display = "block";
		})
		.catch((error) => console.error("Error fetching job details:", error));
}

function bindModalFormActions() {
	document.getElementById("createButton").addEventListener("click", createJob);
	document.getElementById("saveButton").addEventListener("click", updateJob);
	document.getElementById("deleteButton").addEventListener("click", deleteJob);
}

function createJob() {
	const name = document.getElementById("newName").value;
	const cron = document.getElementById("newCron").value;
	const password = document.getElementById("newPassword").value;

	fetch("/api/v1/job/signup", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, cron, password }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job created successfully!");
			location.reload(); // Reload to update the list of jobs
		})
		.catch((error) => {
			console.error("Error creating job:", error);
			alert("Failed to create job.");
		});
}

function updateJob() {
	const jobId = document.getElementById("updateJobId").value;
	const name = document.getElementById("updateName").value;
	const cron = document.getElementById("updateCron").value;
	const status = document.getElementById("updateStatus").value;

	fetch(`/api/v1/job/${jobId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, cron, status }),
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job updated successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error updating job:", error);
			alert("Failed to update job.");
		});
}

function deleteJob() {
	const jobId = document.getElementById("updateJobId").value;

	fetch(`/api/v1/job/${jobId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	})
		.then((response) => response.json())
		.then((data) => {
			alert("Job deleted successfully!");
			location.reload(); // Reload to see changes
		})
		.catch((error) => {
			console.error("Error deleting job:", error);
			alert("Failed to delete job.");
		});
}

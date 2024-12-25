document.addEventListener("DOMContentLoaded", function () {
	fetchResources();
});

function fetchResources() {
	fetch("http://localhost:3000/resources")
		.then((response) => response.json())
		.then((data) => {
			const resourceList = document.getElementById("resourceList");
			resourceList.innerHTML = "";
			data.forEach((resource) => {
				const div = document.createElement("div");
				div.textContent = resource.name;
				resourceList.appendChild(div);
			});
		})
		.catch((error) => console.error("Error:", error));
}

function addResource() {
	const resourceName = document.getElementById("resourceName").value;
	fetch("http://localhost:3000/resources", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: resourceName }),
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("Success:", data);
			fetchResources(); // Refresh the list
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

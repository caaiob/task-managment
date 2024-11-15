document.addEventListener("DOMContentLoaded", function() {
	const addTaskButton = document.getElementById("addTaskButton");
	const taskFormContainer = document.getElementById("taskFormContainer");
	const taskForm = document.getElementById("taskForm");
	const taskInput = document.getElementById("taskInput");
	const taskType = document.getElementById("taskType");
	const taskCategory = document.getElementById("taskCategory");
	const taskDueDate = document.getElementById("taskDueDate");
	const taskTime = document.getElementById("taskTime");
	const taskNameContainer = document.getElementById("taskNameContainer");
	const projectFields = document.getElementById("projectFields");
	const dailyFields = document.getElementById("dailyFields");
	const taskCategoryContainer = document.getElementById("taskCategoryContainer");
	const morningList = document.getElementById("morning-list");
	const afternoonList = document.getElementById("afternoon-list");
	const eveningList = document.getElementById("evening-list");
	const mediumList = document.getElementById("medio-prazo-list");
	const longList = document.getElementById("longo-prazo-list");
	const submitButton = taskForm.querySelector("button[type=submit]");

	function formatDate(date) {
		const [year, month, day] = date.split("-");
		return `${day}/${month}/${year}`;
	}

	const today = new Date().toISOString().split('T')[0];
	taskDueDate.value = today;

	addTaskButton.addEventListener("click", function() {
		taskFormContainer.style.display = taskFormContainer.style.display === "none" ? "block" : "none";
	});

	taskType.addEventListener("change", function() {
		const type = taskType.value;
		taskNameContainer.style.display = type ? "block" : "none";
		dailyFields.style.display = type === "diaria" ? "block" : "none";
		projectFields.style.display = type === "projeto" ? "block" : "none";
		taskCategoryContainer.style.display = type ? "block" : "none";

		if (type) {
			submitButton.classList.add("visible");
		} else {
			submitButton.classList.remove("visible");
		}
	});

	function createEditButton(taskText, category, dueDate, isDaily, time) {
		const editButton = document.createElement("span");
		editButton.classList.add("edit-button");
		editButton.textContent = "✏️";

		editButton.addEventListener("click", function() {
			taskInput.value = taskText;
			taskType.value = isDaily ? "diaria" : "projeto";
			taskDueDate.value = dueDate;
			taskTime.value = time;
			taskCategory.value = category;
			taskFormContainer.style.display = "block";
			const submitButton = taskForm.querySelector("button[type=submit]");

			submitButton.textContent = "Salvar";
			submitButton.onclick = function(event) {
				event.preventDefault();
				updateTask(taskText, category, dueDate, isDaily, time);
				submitButton.textContent = "+";
				submitButton.onclick = null;
			};
		});
		return editButton;
	}

	function addTask(taskText, category, dueDate, isDaily = false, time = null, isCompleted = false) {
		const row = document.createElement("tr");

		const checkboxCell = document.createElement("td");
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.checked = isCompleted;
		checkbox.style.accentColor = "green";
		checkboxCell.appendChild(checkbox);
		checkboxCell.style.textAlign = "center";

		const dateTimeCell = document.createElement("td");
		dateTimeCell.textContent = isDaily ? `Hora: ${time}` : `Data: ${formatDate(dueDate)}`;
		dateTimeCell.style.textAlign = "center";

		const taskTextCell = document.createElement("td");
		taskTextCell.textContent = taskText;
		taskTextCell.style.width = "100%";
		taskTextCell.style.textAlign = "center";

		const editButton = createEditButton(taskText, category, dueDate, isDaily, time);

		const removeButton = document.createElement("span");
		removeButton.innerHTML = "🗑️";
		removeButton.style.cursor = "pointer";
		removeButton.style.marginLeft = "10px";

		removeButton.addEventListener("click", function() {
			const confirmDelete = confirm("Remover tarefa?");
			if (confirmDelete) {
				row.parentNode.removeChild(row);
				removeTaskFromLocalStorage(taskText, category);
			}
		});

		const actionCell = document.createElement("td");
		actionCell.appendChild(editButton);
		actionCell.appendChild(removeButton);
		actionCell.style.textAlign = "center";

		row.appendChild(checkboxCell);
		row.appendChild(dateTimeCell);
		row.appendChild(taskTextCell);
		row.appendChild(actionCell);

		const targetList = getCategoryList(category, time);

		if (targetList) {
			targetList.appendChild(row);
		} else {
			console.error(`List for category "${category}" not found.`);
		}
	}

	function getCategoryList(category, time = null) {
		if (time) {
			const [hours] = time.split(":");
			if (hours < 12) return morningList;
			if (hours < 18) return afternoonList;
			return eveningList;
		}
		return document.getElementById(`${category}-list`);
	}

	function updateTask(taskText, category, dueDate, isDaily, time) {
		removeTaskFromLocalStorage(taskText, category);
		addTaskToLocalStorage(taskInput.value, taskCategory.value, taskDueDate.value, isDaily, taskTime.value);
		loadTasks();
	}

	function updateTaskInLocalStorage(taskText, category, dueDate, isDaily, time, isCompleted) {
		let tasks = JSON.parse(localStorage.getItem(category)) || [];
		const taskIndex = tasks.findIndex(task => task.text === oldTaskText);

		if (taskIndex !== -1) {
			tasks[taskIndex].text = newTaskText;
			tasks[taskIndex].dueDate = dueDate;
			tasks[taskIndex].time = time;
		}
		localStorage.setItem(category, JSON.stringify(tasks));
	}

	function addTaskToLocalStorage(taskText, category, dueDate, isDaily, time, isCompleted = false) {
		let tasks = JSON.parse(localStorage.getItem(category)) || [];
		tasks.push({ text: taskText, completed: isCompleted, dueDate: dueDate, daily: isDaily, time: time });
		localStorage.setItem(category, JSON.stringify(tasks));
	}

	function removeTaskFromLocalStorage(taskText, category) {
		let tasks = JSON.parse(localStorage.getItem(category)) || [];
		tasks = tasks.filter(task => task.text !== taskText);
		localStorage.setItem(category, JSON.stringify(tasks));
	}

	function loadTasks() {
		["curto-prazo", "medio-prazo", "longo-prazo", "diaria"].forEach(category => {
			const tasks = JSON.parse(localStorage.getItem(category)) || [];
			tasks.forEach(task => {
				addTask(task.text, category, task.dueDate, task.daily, task.time, task.completed);
			});
		});
	}

	taskForm.addEventListener("submit", function(event) {
		event.preventDefault();

		const taskText = taskInput.value.trim();
		const category = taskCategory.value;
		const dueDate = taskDueDate.value;
		const isDaily = taskType.value === "diaria";
		const time = taskTime.value || null;

		if (taskText === "") {
			alert("Digite uma tarefa.");
			return;
		}

		addTaskToLocalStorage(taskText, category, dueDate, isDaily, time);
		addTask(taskText, category, dueDate, isDaily, time);

		taskFormContainer.style.display = "none";
		taskInput.value = "";
		taskDueDate.value = today;
		taskTime.value = "";
		taskType.value = "";
		taskNameContainer.style.display = "none";
		dailyFields.style.display = "none";
		projectFields.style.display = "none";
		taskCategoryContainer.style.display = "none";
		submitButton.classList.remove("visible");

		addTaskButton.style.display = "block";
	});

	loadTasks();
});
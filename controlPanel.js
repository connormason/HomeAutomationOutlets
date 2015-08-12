var ref             = new Firebase('https://connormason.firebaseio.com');
var automationRef   = ref.child("homeAutomation");

// ********************** Make values reload when database updated ************

function loadData() {
	// Load modes and generate panel
	automationRef.child("modes").once("value", function(modesSnapshot) {
		// Check to make sure modes reference exists
		if (modesSnapshot.val() === null) {
			console.log("modes reference does not exist");
		}

		generateModesPanel(modesSnapshot)
	});

	// Load modules and generate panels for each
	automationRef.child("relayModules").once("value", function(modulesSnapshot) {
		// Check to make sure relayModules reference exists
		if (modulesSnapshot.val() === null) {
			console.log("relayModules reference does not exist");
		}

		// Loop through all relay modules and create panels
		modulesSnapshot.forEach(function(module) {
			generateModulePanel(module);
		});
	});
}

function chooseButtonColor(value) {
	if (!value) {
		return "btn btn-lg btn-danger"
	} else {
		return "btn btn-lg btn-success"
	}
}

function generatePanelStructure(panelTitleIn) {
	// Create col-md-4 div
	var colElement = document.createElement("div");
	colElement.className = "col-md-4";
	document.getElementById("controlContainer").appendChild(colElement);

	// Create panel
	var panel = document.createElement("div");
	panel.className = "panel panel-default";
	colElement.appendChild(panel);

	// Create panel heading
	var panelHeading = document.createElement("div");
	panelHeading.className = "panel-heading";
	panel.appendChild(panelHeading);

	// Create panel title
	var panelTitle = document.createElement("h3");
	var titleText = document.createTextNode(panelTitleIn);
	panelTitle.className = "panel-title";
	panelTitle.appendChild(titleText);
	panelHeading.appendChild(panelTitle);

	// Create panel body
	var panelBody = document.createElement("div");
	panelBody.className = "panel-body";
	panel.appendChild(panelBody);

	return panelBody;
}

function generateModesPanel(modesSnapshot) {
	// Generate panel body 
	var panelBody = generatePanelStructure("Modes");

	// Create list group
	var listGroup = document.createElement("div");
	listGroup.className = "list-group";
	panelBody.appendChild(listGroup);

	// Create list items
	modesSnapshot.forEach(function(mode) {
		var listItem = document.createElement("a");
		var listItemText = document.createTextNode(mode.val().name);
		listItem.className = "list-group-item";
		listItem.addEventListener("click", function() { selectMode(); })
		listItem.appendChild(listItemText);
		listGroup.appendChild(listItem);
	});
}

function generateModulePanel(moduleData) {
	// Content variables
	var moduleNum = moduleData.key();
	var moduleName = moduleData.val().location;

	// Generate panel body 
	var panelBody = generatePanelStructure("Module " + moduleNum + ": " + moduleName);

	// Create button toolbar
	var buttonToolbar = document.createElement("div");
	buttonToolbar.className = "btn-toolbar";
	panelBody.appendChild(buttonToolbar);

	// Create buttons
	counter = 0;
	moduleData.val().relays.forEach(function(curModule) {
		var curCounter = counter + 1;

		var button = document.createElement("button");
		var buttonTextElement = document.createTextNode(curModule.name);
		button.type = "button";
		button.style.margin = "2px";
		button.className = chooseButtonColor(curModule.value);
		button.id = "module" + moduleNum + "button" + String(curCounter);
		button.addEventListener("click", function() { toggleRelay(moduleNum, curCounter); });
		button.appendChild(buttonTextElement);
		buttonToolbar.appendChild(button);
		counter++;
	});

}

function toggleRelay(moduleNum, buttonNum) {
	automationRef.child("relayModules").once("value", function(modulesSnapshot) {
		// Check to make sure relayModules reference exists
		if (modulesSnapshot.val() === null) {
			console.log("relayModules reference does not exist");
		}

		// Get relay value and toggle
		var curButton = modulesSnapshot.val()[moduleNum].relays[buttonNum];
		var curVal = curButton.value;
		automationRef.child("relayModules").child(moduleNum).child("relays").child(buttonNum).update({value: !curVal});

		// Update button color
		document.getElementById("module" + moduleNum + "button" + buttonNum).className = chooseButtonColor(!curVal);
	});
}

function selectMode() {

}

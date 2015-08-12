var ref             = new Firebase('https://connormason.firebaseio.com');
var automationRef   = ref.child("homeAutomation");

// ********************** Make values reload when database updated ************

function loadData() {
	// Load modules
	automationRef.child("relayModules").once("value", function(modulesSnapshot) {
		// Check to make sure relayModules reference exists
		if (modulesSnapshot.val() === null) {
			console.log("relayModules reference does not exist");
		}

		// Loop through all relay modules and create panels
		modulesSnapshot.forEach(function(module) {
			createModule(module);
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

function generatePanel(panelTitleIn) {
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

function createModule(moduleData) {
	// Content variables
	var moduleNum = moduleData.key();
	var moduleName = moduleData.val().location;
	var buttonText = [moduleData.val().relays[1].name, moduleData.val().relays[2].name, 
					moduleData.val().relays[3].name, moduleData.val().relays[4].name];
	var buttonValue = [moduleData.val().relays[1].value, moduleData.val().relays[2].value, 
					moduleData.val().relays[3].value, moduleData.val().relays[4].value];

	// Generate module panel 
	var panelBody = generatePanel("Module " + moduleNum + ": " + moduleName);

	// Create button toolbar
	var buttonToolbar = document.createElement("div");
	buttonToolbar.className = "btn-toolbar";
	panelBody.appendChild(buttonToolbar);

	// Create buttons
	for (var i = 0; i < 4; i++) {
		var button = document.createElement("button");
		var buttonTextElement = document.createTextNode(buttonText[i]);
		button.type = "button";
		button.style.margin = "2px";
		button.className = chooseButtonColor(buttonValue[i]);
		button.id = "module" + moduleNum + "button" + String(i + 1);
		button.addEventListener("click", function() { toggleRelay(moduleNum, i + 1); });
		button.appendChild(buttonTextElement);
		buttonToolbar.appendChild(button);
	}
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

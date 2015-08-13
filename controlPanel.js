var ref             = new Firebase('https://connormason.firebaseio.com');
var automationRef   = ref.child("homeAutomation");
var relayModulesRef = automationRef.child("relayModules");
var modesRef 		= automationRef.child("modes");

// ********************** Make values reload when database updated ************

function loadData() {
	// Load modes and generate panel
	modesRef.once("value", function(modesSnapshot) {
		// Check to make sure modes reference exists
		if (modesSnapshot.val() === null) {
			console.log("modes reference does not exist");
			return;
		}

		generateModesPanel(modesSnapshot)
	});

	// Load modules and generate panels for each
	relayModulesRef.once("value", function(modulesSnapshot) {
		// Check to make sure relayModules reference exists
		if (modulesSnapshot.val() === null) {
			console.log("relayModules reference does not exist");
			return;
		}

		// Loop through all relay modules and create panels
		modulesSnapshot.forEach(function(module) {
			generateModulePanel(module);
		});
	});
}

function isInArray(value, array) {
	if (array === null) {
		return false;
	}

	return array.indexOf(value) > -1;
}

function chooseButtonColor(value) {
	if (!value) {
		return "btn btn-lg btn-danger"
	} else {
		return "btn btn-lg btn-success"
	}
}

function displaySelectedListItem(modeSelected) {
	var listItems = document.getElementById("modesList").getElementsByTagName("a");

	// Clear all selected items
	for (var i = 0; i < listItems.length; i++) {
		listItems[i].className = "list-group-item"; 
	}

	// Highlight selected mode
	modeSelected.className = "list-group-item active";
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
	listGroup.id = "modesList";
	panelBody.appendChild(listGroup);

	// Create list items
	var counter = 1;
	modesSnapshot.forEach(function(mode) {
		var listItem = document.createElement("a");
		var listItemText = document.createTextNode(mode.val().name);
		listItem.className = "list-group-item";
		listItem.id = "mode" + counter; 
		listItem.name = mode.val().name;
		listItem.addEventListener("click", function() { selectMode(listItem.id); })
		listItem.appendChild(listItemText);
		listGroup.appendChild(listItem);
		counter++;
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
	relayModulesRef.once("value", function(modulesSnapshot) {

		// Check to make sure relayModules reference exists
		if (modulesSnapshot.val() === null) {
			console.log("relayModules reference does not exist");
			return;
		}

		// Get relay value and toggle
		var curButton = modulesSnapshot.val()[moduleNum].relays[buttonNum];
		var curVal = curButton.value;
		automationRef.child("relayModules").child(moduleNum).child("relays").child(buttonNum).update({value: !curVal});

		// Update button color
		document.getElementById("module" + moduleNum + "button" + buttonNum).className = chooseButtonColor(!curVal);
	});
}

// Update button color based on value
function setButtonColor(moduleNum, buttonNum, boolValue) {
	document.getElementById("module" + moduleNum + "button" + buttonNum).className = chooseButtonColor(boolValue);
}

function selectMode(modeID) {
	// Get reference to list item selected
	var modeSelected = document.getElementById(modeID);

	// Pull list of modes
	modesRef.once("value", function(modesSnapshot) {
		var modesData = modesSnapshot.val();

		// Check to make sure modes reference exists
		if (modesSnapshot.val() === null) {
			console.log("modes reference does not exist");
			return;
		}

		// Search for selected mode
		var found = false;
		modesSnapshot.forEach(function(mode) {

			if (mode.key() === modeSelected.name) {

				// If selected mode found, pull "on" devices data
				modesRef.child(modeSelected.name).child("devices").once("value", function(devicesSnapshot) {

					// Then pull relayModules
					relayModulesRef.once("value", function(modulesSnapshot) {

						// Check to make sure relayModules reference exists
						if (modulesSnapshot.val() === null) {
							console.log("relayModules reference does not exist");
							return;
						}

						// Loop through all relay modules
						modulesSnapshot.forEach(function(module) {
							var moduleData = module.val();

							// Loop through all relays
							var index = 0;
							module.val().relays.forEach(function(relay) {

								// Turn device on if in mode devices, off otherwise
								if (isInArray(relay.name, devicesSnapshot.val())) {
									moduleData.relays[index + 1].value = true;
									setButtonColor(module.key(), index + 1, true);
								} else {
									moduleData.relays[index + 1].value = false;
									setButtonColor(module.key(), index + 1, false);
								}
								index++;
							});
							module.ref().set(moduleData);
						});

						// Set mode as active
						modesData[modeSelected.name].active = true;
						// modesSnapshot.ref().set(modesData);
					});
				});
				found = true;
			} else {
				// Set mode to inactive
				modesData[mode.key()].active = false;
				// modesSnapshot.ref().set(modesData);
			}
		});
		modesSnapshot.ref().set(modesData);

		// Fallback if for some reason mode is not found in database
		if (!found) {
			console.log("selected mode not found in database");
			return;
		}
	});

	// Update interface to show list item as selected
	displaySelectedListItem(modeSelected);
}

var ref             = new Firebase('https://connormason.firebaseio.com');
var automationRef   = ref.child("homeAutomation");

// ********************** Make values reload when database updated ************

function loadData() {
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

function createModule(moduleData) {
	// Content variables
	var moduleNum = moduleData.key();
	var moduleName = moduleData.val().location;
	var button1Text = moduleData.val().relays[1].name;
	var button2Text = moduleData.val().relays[2].name;
	var button3Text = moduleData.val().relays[3].name;
	var button4Text = moduleData.val().relays[4].name;
	var button1Value = moduleData.val().relays[1].value;
	var button2Value = moduleData.val().relays[2].value;
	var button3Value = moduleData.val().relays[3].value;
	var button4Value = moduleData.val().relays[4].value;

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
	var titleText = document.createTextNode("Module " + moduleNum + ": " + moduleName);
	panelTitle.className = "panel-title";
	panelTitle.appendChild(titleText);
	panelHeading.appendChild(panelTitle);

	// Create panel body
	var panelBody = document.createElement("div");
	panelBody.className = "panel-body";
	panel.appendChild(panelBody);

	// Create button toolbar
	var buttonToolbar = document.createElement("div");
	buttonToolbar.className = "btn-toolbar";
	panelBody.appendChild(buttonToolbar);

	// Create buttons
	var button1 = document.createElement("button");
	var button1TextElement = document.createTextNode(button1Text);
	button1.type = "button";
	button1.style.margin = "2px";
	button1.className = chooseButtonColor(button1Value);
	button1.id = "module" + moduleNum + "button1";
	button1.addEventListener("click", function() { toggleRelay(moduleNum, 1); });
	button1.appendChild(button1TextElement);
	buttonToolbar.appendChild(button1);

	var button2 = document.createElement("button");
	var button2TextElement = document.createTextNode(button2Text);
	button2.type = "button";
	button2.style.margin = "2px";
	button2.className = chooseButtonColor(button2Value);
	button2.id = "module" + moduleNum + "button2";
	button2.addEventListener("click", function() { toggleRelay(moduleNum, 2); });
	button2.appendChild(button2TextElement);
	buttonToolbar.appendChild(button2);

	var button3 = document.createElement("button");
	var button3TextElement = document.createTextNode(button3Text);
	button3.type = "button";
	button3.style.margin = "2px";
	button3.className = chooseButtonColor(button3Value);
	button3.id = "module" + moduleNum + "button3";
	button3.addEventListener("click", function() { toggleRelay(moduleNum, 3); });
	button3.appendChild(button3TextElement);
	buttonToolbar.appendChild(button3);

	var button4 = document.createElement("button");
	var button4TextElement = document.createTextNode(button4Text);
	button4.type = "button";
	button4.style.margin = "2px";
	button4.className = chooseButtonColor(button4Value);
	button4.id = "module" + moduleNum + "button4";
	button4.addEventListener("click", function() { toggleRelay(moduleNum, 4); });
	button4.appendChild(button4TextElement);
	buttonToolbar.appendChild(button4);
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

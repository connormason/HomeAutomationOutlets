var ref             = new Firebase('https://connormason.firebaseio.com');
var relayModulesRef = ref.child("homeAutomation").child("relayModules");

function createNewElement() {
	// Content variables
	var moduleNum = 1;
	var moduleName = "Desk";
	var button1Text = "Desk Lamp";
	var button2Text = "Rope Light";
	var button3Text = "Monitor 1";
	var button4Text = "Monitor 2";

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
	button1.className = "btn btn-lg btn-danger"
	button1.addEventListener("click", createNewElement);
	button1.appendChild(button1TextElement);
	buttonToolbar.appendChild(button1);

	var button2 = document.createElement("button");
	var button2TextElement = document.createTextNode(button2Text);
	button2.type = "button";
	button2.style.margin = "2px";
	button2.className = "btn btn-lg btn-danger"
	button2.addEventListener("click", createNewElement);
	button2.appendChild(button2TextElement);
	buttonToolbar.appendChild(button2);

	var button3 = document.createElement("button");
	var button3TextElement = document.createTextNode(button3Text);
	button3.type = "button";
	button3.style.margin = "2px";
	button3.className = "btn btn-lg btn-danger"
	button3.addEventListener("click", createNewElement);
	button3.appendChild(button3TextElement);
	buttonToolbar.appendChild(button3);

	var button4 = document.createElement("button");
	var button4TextElement = document.createTextNode(button4Text);
	button4.type = "button";
	button4.style.margin = "2px";
	button4.className = "btn btn-lg btn-danger"
	button4.addEventListener("click", createNewElement);
	button4.appendChild(button4TextElement);
	buttonToolbar.appendChild(button4);
}

function toggleRelay() {

}
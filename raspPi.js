var SerialPort = require("serialport");
var colors     = require("colors/safe");
    Firebase   = require("firebase");

// Configuration variables
var verbose = true;

// Firebase references
var ref             = new Firebase('https://connormason.firebaseio.com');
var automationRef   = ref.child("homeAutomation");
var modesRef        = automationRef.child("modes");
var relayModulesRef = automationRef.child("relayModules");

// ********************* Functions *********************
function sendRelayData(module, data) {
    if (verbose) { console.log(colors.green("Sending updated relay info for module " + module + " to Arduino...")); }
}

function sendModeData(data) {
    
}
// ********************* /Functions ********************

// If relay values change, act accordingly
relayModulesRef.on("child_changed", function(modulesSnapshot) {
// relayModulesRef.once("value", function(modulesSnapshot) {
    if (verbose) { console.log("relayModules child changed"); }

    // Compress data into smaller JSON object and send to Arduino
    var modulePacket = {};
    var relays = modulesSnapshot.val().relays;
    for (var i = 1; i < relays.length; i++) {
        modulePacket[i] = relays[i].value;
    }
    sendRelayData(modulesSnapshot.val().moduleNum, modulePacket);
});

// If mode values change, act accordingly
modesRef.on("child_changed", function(modesSnapshot) {
    if (verbose) { console.log("modes child changed"); }
});
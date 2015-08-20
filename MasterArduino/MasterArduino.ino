#include <aJSON.h>

#define ACTIVITYLED 13

aJsonStream serial_stream(&Serial);

// Blinks activity LED for short amount of time, x times
void blinkActivity(int waitAfter, int x) {
  for (int i = 0; i < x; i++) {
    digitalWrite(ACTIVITYLED, HIGH);
    delay(100);
    digitalWrite(ACTIVITYLED, LOW);
    delay(waitAfter);
  }
}

void setup() {
	Serial.begin(9600);

	pinMode(ACTIVITYLED, OUTPUT);
	blinkActivity(50, 4);

	serial_stream.flush();
}

int processData(aJsonObject *data) {
	return 1;
}

void loop() {
  if (serial_stream.available()) {
    serial_stream.skip();
  }

  if (serial_stream.available()) {
  	blinkActivity(50, 2);
    // Parse input
    aJsonObject *incomingData = aJson.parse(&serial_stream);
    int returnVal = processData(incomingData);
    aJson.deleteItem(incomingData);
    serial_stream.flush();

    // // Send response
    // aJsonObject *response = createResponseMessage(returnVal);
    // aJson.print(response, &serial_stream);
    // Serial.println();
    // aJson.deleteItem(response);
  }
}

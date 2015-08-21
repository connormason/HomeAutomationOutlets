// Code to run on master Arduino (connected to Raspberry Pi)

/* 
Arduino Outputs:
Analog:
0  --> unused
1  --> unused
2  --> unused
3  --> unused
4  --> unused
5  --> unused
Digital:
0  --> unused
1  --> unused
2  --> unused
3  --> unused
4  --> unused
5  --> unused
6  --> unused
7  --> unused
8  --> Activity LED (if connected)
9  --> RF CSN
10 --> RF CE
11 --> RF MOSI
12 --> RF MISO
13 --> RF SCK
*/

#include <aJSON.h>
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"

#define ACTIVITYLED 13

#define CSN_PIN 9
#define CE_PIN 10

aJsonStream serial_stream(&Serial);

// Initialization and pipe for RF module
RF24 radio(CE_PIN, CSN_PIN);
const uint64_t pipe = 0xE8E8F0F0E1LL;
int data[3];  // data[0] = signal type, data[1] = relayModule, data[2] = value

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

	// Start RF radio
	radio.begin();
	radio.openWritingPipe(pipe);

	delay(500);
}

void sendRF(int signalType, int module, int value) {
	data[0] = signalType;
	data[1] = module;
	data[2] = value;
	radio.write(data, sizeof(data));
}

bool bloop = false;

int processData(aJsonObject *data) {
	if (bloop) {
		sendRF(0, 0x01, 0);
		bloop = false;
	} else {
		sendRF(0, 0x01, 0);
		bloop = true;
	}
	

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

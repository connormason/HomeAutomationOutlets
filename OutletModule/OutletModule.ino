// Code to run on outlet modules

/* 
Arduino Outputs:
Analog:
0  --> Relay 5
1  --> Relay 6
2  --> Relay 7
3  --> Relay 8
4  --> unused
5  --> unused
Digital:
0  --> unused
1  --> unused
2  --> unused
3  --> unused
4  --> Relay 1
5  --> Relay 2
6  --> Relay 3
7  --> Relay 4
8  --> Activity LED (if connected)
9  --> RF CSN
10 --> RF CE
11 --> RF MOSI
12 --> RF MISO
13 --> RF SCK
*/

#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"

#define CSN_PIN 9
#define CE_PIN 10

#define ACTIVITY_LED 8

#define RELAY_ONE 4
#define RELAY_TWO 5
#define RELAY_THREE 6
#define RELAY_FOUR 7
#define RELAY_FIVE 14
#define RELAY_SIX 15
#define RELAY_SEVEN 16
#define RELAY_EIGHT 17

const int RELAY_MODULE = 0x01;
const uint64_t pipe = 0xE8E8F0F0E1LL;
bool invertRelays = false;

int data[4];
int curRelays = 0;

RF24 radio(CE_PIN, CSN_PIN);

void blinkActivity() {
	digitalWrite(ACTIVITY_LED, HIGH);
	delay(100);
	digitalWrite(ACTIVITY_LED, LOW); 
	delay(100);
}

void setRelays() {
	int relaysVal = curRelays;
	if (invertRelays) {
		relaysVal = -relaysVal - 1;
	}

	digitalWrite(RELAY_FIVE, (relaysVal & 128) / 128);
	digitalWrite(RELAY_SIX, (relaysVal & 64) / 64);
	digitalWrite(RELAY_SEVEN, (relaysVal & 32) / 32);
	digitalWrite(RELAY_EIGHT, (relaysVal & 16) / 16);
	digitalWrite(RELAY_FIVE, (relaysVal & 8) / 8);
	digitalWrite(RELAY_SIX, (relaysVal & 4) / 4);
	digitalWrite(RELAY_SEVEN, (relaysVal & 2) / 2);
	digitalWrite(RELAY_EIGHT, (relaysVal & 1) / 1);
}

void setup() {
	// Set pins
	pinMode(RELAY_ONE, OUTPUT);
	pinMode(RELAY_TWO, OUTPUT);
	pinMode(RELAY_THREE, OUTPUT);
	pinMode(RELAY_FOUR, OUTPUT);
	pinMode(RELAY_FIVE, OUTPUT);
	pinMode(RELAY_SIX, OUTPUT);
	pinMode(RELAY_SEVEN, OUTPUT);
	pinMode(RELAY_EIGHT, OUTPUT);

	pinMode(ACTIVITY_LED, OUTPUT);

	// Read module number from EEPROM
	moduleNum = EEPROM.read(MODULE_NUM_ADDR);
	for (int i = 0; i < moduleNum; i++) {
		blinkActivity();
	}

	// Start RF radio
	radio.begin();
	radio.openReadingPipe(1, pipe);
	radio.startListening();

	// Set initial relay values
	setRelays();
}

void loop() {
	// Wait for signal to be received
	if (radio.available()) {
		blinkActivity();

		// Dump payloads until all data has been received
		bool done = false;
		while (!done) {
			done = radio.read(data, sizeof(data));
		}
	}

	// If correct signal type, set relays
	if ((data[0] == 0) && (data[1] == RELAY_MODULE)) {
		curRelays = data[2];
		setRelays();
	}

	// Send response?
}
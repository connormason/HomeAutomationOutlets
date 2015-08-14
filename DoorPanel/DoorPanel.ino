// Code for the room control panel mounted near the door (light switch)

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
 0  --> unused (USB RX)
 1  --> unused (USB TX)
 2  --> LCD UART
 3  --> Rotary encoder 1
 4  --> Rotary encoder 2
 5  --> Rotary encoder click
 6  --> unused
 7  --> RF CE
 8  --> RF CSN
 9  --> unused
 10 --> unused
 11 --> RF MOSI
 12 --> RF MISO
 13 --> RF SCK
 */

#include <EEPROM.h>
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
#include <SoftwareSerial.h>

// Pin values
#define ROTARY_CLICK     3
#define ROTARY_IN_A      5
#define ROTARY_IN_B      4
#define ROTARY_PINx      PIND
#define LCD_PIN          2
#define CE_PIN           7
#define CSN_PIN          8

// Variables for rotary encoder
static uint8_t enc_prev_pos = 0;
static uint8_t enc_flags    = 0;

// Initialization and pipe for RF module
const uint64_t readingPipe = 0xE8E8F0F0E1LL;
const uint64_t writingPipe = 0xF8F8E0E0E1LL;
RF24 radio(CE_PIN, CSN_PIN);
int data[4];

// Initialize LCD display
SoftwareSerial lcd = SoftwareSerial(0,LCD_PIN); 

// Mode variables
int curMode     = 4;
int activeMode  = 4;

// Reads the value of the rotary encoder
int8_t readRotaryEncoder() {
	int8_t enc_action   = 0;  // 1 or -1 if moved, sign is direction
	uint8_t enc_cur_pos = 0;

	// Read in the encoder state first
	if (bit_is_clear(ROTARY_PINx, ROTARY_IN_A)) {
		enc_cur_pos |= (1 << 0);
	}
	if (bit_is_clear(ROTARY_PINx, ROTARY_IN_B)) {
		enc_cur_pos |= (1 << 1);
	}

	// If any rotation at all
	if (enc_cur_pos != enc_prev_pos) {
		if (enc_prev_pos == 0x00) {
			// This is the first edge
			if (enc_cur_pos == 0x01) {
				enc_flags |= (1 << 0);
			}
			else if (enc_cur_pos == 0x02) {
				enc_flags |= (1 << 1);
			}
		}

		if (enc_cur_pos == 0x03) {
			// This is when the encoder is in the middle of a "step"
			enc_flags |= (1 << 4);
		} else if (enc_cur_pos == 0x00) { 
			// This is the final edge
			if (enc_prev_pos == 0x02) {
				enc_flags |= (1 << 2);
			} else if (enc_prev_pos == 0x01) {
				enc_flags |= (1 << 3);
			}

			// Check the first and last edge
			// Or maybe one edge is missing, if missing then require the middle state
			// This will reject bounces and false movements
			if (bit_is_set(enc_flags, 0) && (bit_is_set(enc_flags, 2) || bit_is_set(enc_flags, 4))) {
				enc_action = 1;
			} else if (bit_is_set(enc_flags, 2) && (bit_is_set(enc_flags, 0) || bit_is_set(enc_flags, 4))) {
				enc_action = 1;
			} else if (bit_is_set(enc_flags, 1) && (bit_is_set(enc_flags, 3) || bit_is_set(enc_flags, 4))) {
				enc_action = -1;
			} else if (bit_is_set(enc_flags, 3) && (bit_is_set(enc_flags, 1) || bit_is_set(enc_flags, 4))) {
				enc_action = -1;
			}

			enc_flags = 0; // Reset for next time
		}
	}
	enc_prev_pos = enc_cur_pos;

	return(enc_action);
}

void initLCD() {
	lcd.begin(9600);

	// set the size of the display
	lcd.write(0xFE);
	lcd.write(0xD1);
	lcd.write(16);    // 16 columns
	lcd.write(2);     // 2 rows
	delay(10); 

	// set the contrast
	lcd.write(0xFE);
	lcd.write(0x50);
	lcd.write(200);
	delay(10);   

	// set the brightness
	lcd.write(0xFE);
	lcd.write(0x99);
	lcd.write(255);
	delay(10);  

	// turn off cursors
	lcd.write(0xFE);
	lcd.write(0x4B);
	lcd.write(0xFE);
	lcd.write(0x54);
	delay(10);

	// splash screen
	lcd.print("Home Automation");
	lcd.print("by: Connor Mason");
	delay(1500);

	// clear screen and return to top left corner
	clearLCD();
}

// Sets the LCD's backlight color
void setLCDBacklight(uint8_t red, uint8_t green, uint8_t blue) {
	// set backlight RGB values based on inputs
	lcd.write(0xFE);
	lcd.write(0xD0);
	lcd.write(red);
	lcd.write(green);
	lcd.write(blue);
	delay(10);
}

// Clears the LCD
void clearLCD() {
	// clear the LCD and return cursor to top left corner
	lcd.write(0xFE);
	lcd.write(0x58);
	lcd.write(0xFE);
	lcd.write(0x48);
	delay(10);
}

void setLCD() {
  if (curMode == 0) {
	setLCDBacklight(0xFF, 0x0, 0x80);
	clearLCD();
	lcd.print("Rage mode       ");
	if (activeMode == 0) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 1) {
	setLCDBacklight(0xFF, 0x0, 0xFF);
	clearLCD();
	lcd.print("Party lighting  ");
	if (activeMode == 1) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 2) {
	setLCDBacklight(0xFF, 0xFF, 0xFF);
	clearLCD();
	lcd.print("Normal lighting ");
	if (activeMode == 2) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 3) {
	setLCDBacklight(0x80, 0xFF, 0xFF);
	clearLCD();
	lcd.print("Study mode      ");
	if (activeMode == 3) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 4) {
	setLCDBacklight(0x0, 0x0, 0xFF);
	clearLCD();
	lcd.print("Chill lighting  ");
	if (activeMode == 4) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 5) {
	setLCDBacklight(0x0, 0xFF, 0x0);
	clearLCD();
	lcd.print("Lights off      ");
	if (activeMode == 5) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 6) {
	setLCDBacklight(0xFF, 0x0, 0x0);
	clearLCD();
	lcd.print("Night mode      ");
	if (activeMode == 6) {
	  lcd.print("  ACTIVE");
	}
  } else if (curMode == 7) {
	setLCDBacklight(0xFF, 0x0, 0x0);
	clearLCD();
	lcd.print("Everything off  ");
	if (activeMode == 7) {
	  lcd.print("  ACTIVE");
	}
  }
}

void setup() {  
	// Set rotary encoder pins (all pull-up)
	pinMode(ROTARY_CLICK, INPUT);
	pinMode(ROTARY_IN_A, INPUT);
	pinMode(ROTARY_IN_B, INPUT);
	digitalWrite(ROTARY_CLICK, HIGH);
	digitalWrite(ROTARY_IN_A, HIGH);
	digitalWrite(ROTARY_IN_B, HIGH);

	// Initialize mode variables
	curMode = 4;
	activeMode = 4;

	// Get initial reading from encoder pins
	if (digitalRead(ROTARY_IN_A) == LOW) {
		enc_prev_pos |= (1 << 0);
	}
	if (digitalRead(ROTARY_IN_B) == LOW) {
		enc_prev_pos |= (1 << 1);
	}
	setLCD();

	// begin LCD display and RF module
	Serial.begin(9600);
	initLCD();
	radio.begin();
	radio.openWritingPipe(pipe);

	delay(500);
}

void loop() {
	// Listen for RF transmissions
	if (radio.available()) {
		// Dump payloads until everything received
		bool done = false;
		while (!done) {
			done = radio.read(data, sizeof(data));
		}

		// Read data if meant for door panel
		if (data[0] == 1) {
			
		}

		// send response?
	}


	// Read rotary encoder values
	int8_t rotaryVal = readRotaryEncoder();
	int8_t clickState = digitalRead(ROTARY_CLICK);

	if (clickState == LOW) {
		// Selection made
		activeMode = curMode;
		setMode();
		setLCD();
	}

	// Update screen selection
	if ((rotaryVal > 0) && (curMode < 7)) {
		curMode++;
		setLCD();
	} else if ((rotaryVal < 0) && (curMode > 0)) {
		curMode--;
		setLCD();
  	}
}


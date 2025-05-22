import RPi.GPIO as GPIO
import time
import sys

# Actuator pin mappings
ACTUATOR_PINS = {
    1: {"in1": 16, "in2": 20, "ena": 21},
    2: {"in1": 13, "in2": 19, "ena": 26},
    3: {"in1": 10, "in2": 9,  "ena": 11}
}

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

PWM = {}

for num, pins in ACTUATOR_PINS.items():
    GPIO.setup(pins["in1"], GPIO.OUT)
    GPIO.setup(pins["in2"], GPIO.OUT)
    GPIO.setup(pins["ena"], GPIO.OUT)
    pwm = GPIO.PWM(pins["ena"], 1000)
    pwm.start(0)
    PWM[num] = pwm

def extend(actuator_num, speed=100):
    pins = ACTUATOR_PINS[actuator_num]
    GPIO.output(pins["in1"], GPIO.HIGH)
    GPIO.output(pins["in2"], GPIO.LOW)
    PWM[actuator_num].ChangeDutyCycle(speed)

def retract(actuator_num, speed=100):
    pins = ACTUATOR_PINS[actuator_num]
    GPIO.output(pins["in1"], GPIO.LOW)
    GPIO.output(pins["in2"], GPIO.HIGH)
    PWM[actuator_num].ChangeDutyCycle(speed)

def stop(actuator_num):
    pins = ACTUATOR_PINS[actuator_num]
    GPIO.output(pins["in1"], GPIO.LOW)
    GPIO.output(pins["in2"], GPIO.LOW)
    PWM[actuator_num].ChangeDutyCycle(0)

def dispense_doses(actuator_num, dose_count):
    print(f"[RUNNING] Actuator {actuator_num} - {dose_count} doses")
    for i in range(dose_count):
        print(f"[ACTUATOR {actuator_num}] Dose {i+1}/{dose_count} - Extending")
        extend(actuator_num)
        time.sleep(1.8)
        print(f"[ACTUATOR {actuator_num}] Retracting")
        retract(actuator_num)
        time.sleep(2.2)
        stop(actuator_num)
        time.sleep(1)
    print(f"[COMPLETE] Actuator {actuator_num} finished all doses")

def home_all():
    print("Initializing actuators to starting position...")
    for i in ACTUATOR_PINS:
        retract(i)
        time.sleep(2.3)
        stop(i)
        time.sleep(1)

if __name__ == "__main__":
    actuator_num = None
    try:
        if len(sys.argv) == 2 and sys.argv[1] == "--init":
            home_all()

        elif len(sys.argv) == 3:
            actuator_num = int(sys.argv[1])
            dose_count = int(sys.argv[2])
            print(f"[INFO] Received actuator {actuator_num} for {dose_count} dose(s) via subprocess")
            dispense_doses(actuator_num, dose_count)

        else:
            print("[USAGE] python3 fin_act.py <actuator_num> <dose>  or  --init")

    finally:
        if actuator_num in ACTUATOR_PINS:
            print(f"[CLEANUP] Cleaning actuator {actuator_num} GPIO")
            PWM[actuator_num].stop()
            pins = ACTUATOR_PINS[actuator_num]
            GPIO.output(pins["in1"], GPIO.LOW)
            GPIO.output(pins["in2"], GPIO.LOW)
            GPIO.cleanup([pins["in1"], pins["in2"], pins["ena"]])
        else:
            print("[CLEANUP] Cleaning all GPIO")
            for num, pins in ACTUATOR_PINS.items():
                PWM[num].stop()
                GPIO.output(pins["in1"], GPIO.LOW)
                GPIO.output(pins["in2"], GPIO.LOW)
            GPIO.cleanup()
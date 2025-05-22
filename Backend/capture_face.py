from picamera2 import Picamera2
import time

picam2 = Picamera2()
picam2.configure(picam2.create_still_configuration(main={"format": "RGB888", "size": (320, 240)}))
picam2.start()
time.sleep(2)
picam2.capture_file("/home/pi/captured_face.jpg")
picam2.stop()

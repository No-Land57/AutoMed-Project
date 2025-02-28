import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FaceID({ navigation }) {
  const [facing, setFacing] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [photoCount, setPhotoCount] = useState(0);

  if (!permission || !mediaPermission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Camera Permission" />
      </View>
    );
  }

  if (!mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need permission to save photos</Text>
        <Button onPress={requestMediaPermission} title="Grant Media Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    if (photoCount >= 3) {
      alert('You have already taken 3 photos!');
      return;
    }

    const photo = await cameraRef.current.takePictureAsync();
    await MediaLibrary.saveToLibraryAsync(photo.uri);
    console.log(`Photo ${photoCount + 1} saved:`, photo.uri);
    setPhotoCount(photoCount + 1);

    if (photoCount + 1 === 3) {
      alert('You have taken 3 photos. All saved to gallery!');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.smoothBox}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
            <View style={styles.faceGuide} />
        </CameraView>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.text}>Take Picture ({photoCount}/3)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background for contrast
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  smoothBox: {
    width: '90%',
    height: '60%',
    borderRadius: 20, // Smooth rounded corners
    overflow: 'hidden', // Ensures the camera fits neatly inside
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'black',
    position: 'relative',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  faceGuide: {
    position: 'absolute',
    top: '25%', // Adjusts vertical position
    left: '20%', // Centers horizontally
    width: '60%', // Width of the oval
    height: '60%', // Height of the oval
    borderRadius: 100, // Makes it an oval
    borderWidth: 3,
    borderColor: 'rgb(18, 128, 46)', // White semi-transparent border
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

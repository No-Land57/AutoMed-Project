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
  const [photos, setPhotos] = useState([]);

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

    const photo = await cameraRef.current.takePictureAsync({ base64: false });
    setPhotos(prev => [...prev, photo]);
    setPhotoCount(prev => prev + 1);

    if (photoCount + 1 === 3) {
      alert('You have taken 3 photos. Uploading...');
      await uploadImages([...photos, photo]);
    }
  }

  async function uploadImages(images) {
    const formData = new FormData();
    formData.append('image1', {
      uri: images[0].uri,
      type: 'image/jpeg',
      name: 'image1.jpg',
    });
    formData.append('image2', {
      uri: images[1].uri,
      type: 'image/jpeg',
      name: 'image2.jpg',
    });
    formData.append('image3', {
      uri: images[2].uri,
      type: 'image/jpeg',
      name: 'image3.jpg',
    });
  
    try {
      const response = await fetch('http://192.168.0.240:5000/SetFaceID', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        credentials: 'include',
        body: formData,
      });
  
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        console.log(data);
        if (response.ok) {
          alert('Images uploaded successfully!');
        } else {
          alert(data.Message || 'Upload failed');
        }
      } catch (err) {
        console.error('Non-JSON response:', responseText);
        alert('Unexpected server response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error');
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
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            photoCount === 3
              ? navigation.navigate('SetSched')
              : alert('Please take 3 photos')
          }
        >
          <Text style={styles.text}>Next</Text>
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
    backgroundColor: '#121212',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  smoothBox: {
    width: '90%',
    height: '60%',
    borderRadius: 20,
    overflow: 'hidden',
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
    top: '25%',
    left: '20%',
    width: '60%',
    height: '60%',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: 'rgb(30, 206, 74)',
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

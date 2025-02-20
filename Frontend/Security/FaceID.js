import React, {useState, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';

export default function FaceID({navigation}) {
    const cameraRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [photoCount, setPhotoCount] = useState(0);

    const takePicture = async () => {
        if (cameraRef.current) {
            const options = {quality: 0.5, base64: true};
            const data = await cameraRef.current.takePictureAsync(options);
            const newPhotos = [...photos, data.uri];
            setPhotos(newPhotos);
            setPhotoCount(photoCount + 1);

            if (newPhotos.length === 3) {
                Alert.alert('Success', 'Face ID has been set!');
                navigation.navigate('SetSched');
            }
        }
    };

    return (
        <View style={styles.container}>
            <RNCamera
                ref={cameraRef}
                style={styles.preview}
                type={RNCamera.Constants.Type.front}
                flashMode={RNCamera.Constants.FlashMode.off}
                captureAudio={false}
            />
            <View style={styles.captureContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.capture}>
                    <Text style={styles.captureText}>Capture</Text>
                </TouchableOpacity>
                <Text style={styles.photoCount}>{photoCount}/3</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black',
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    captureContainer: {
      flex: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },
    captureText: {
      fontSize: 14,
    },
    photoCount: {
      color: '#fff',
      fontSize: 18,
    },
  });
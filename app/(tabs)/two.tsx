import React, { useRef, useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import { Button, ImageBackground, Text, TouchableOpacity, View, Dimensions, Linking } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function TabTwoScreen() {
  const [status, requestPermission] = Camera.useCameraPermissions();
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [lastPhotoURI, setLastPhotoURI] = useState<string | null>(null);
  const [cameraRatio, setCameraRatio] = useState<string>('3:2');
  const cameraRef = useRef<Camera | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      if (cameraRef.current) {
        const ratios = await cameraRef.current.getSupportedRatiosAsync();

        // Get the device's aspect ratio
        const deviceAspectRatio = Dimensions.get('window').width / Dimensions.get('window').height;
        
        // Find a suitable ratio based on the device's aspect ratio
        const suitableRatio = ratios.find(ratio => {
          const [numerator, denominator] = ratio.split(':');
          const aspectRatio = parseInt(numerator) / parseInt(denominator);
          console.log('Checking ratio:', ratio, 'with aspect ratio:', aspectRatio);
          
          // Check if the aspect ratio is close to the device's aspect ratio
          return Math.abs(aspectRatio - deviceAspectRatio) < 0.1;
        });

        setCameraRatio(suitableRatio || '3:2'); // Set default to 3:2 if no suitable ratio is found
      }
    })();
  }, []);

  if (!status?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ textAlign: "center" }}>
          We need access to your camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  if (lastPhotoURI !== null) {
    return (
      <ImageBackground
        source={{ uri: lastPhotoURI }}
        style={{
          flex: 1,
          backgroundColor: "transparent",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 0.2,
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(102, 102, 102, 0.5)",
            marginBottom: 40,
            marginLeft: 20,
          }}
          onPress={() => {
            setLastPhotoURI(null);
          }}
        >
          <Text style={{ fontSize: 30, padding: 10, color: "white" }}>❌</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  if (!isFocused) {
    // Return empty View or your placeholder when the screen is not focused
    return <View />;
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (hasScanned) return; // If already scanned, do nothing
    setHasScanned(true); // Set the scanned state to true
  
    // Show an alert with the scanned data and options to copy to clipboard or open in browser
    Alert.alert(
      'Barcode Scanned',
      data,
      [
        { text: 'CLOSE', onPress: () => {setHasScanned(false)} },
        {
          text: 'Copy to Clipboard',
          onPress: async () => {
            await Clipboard.setStringAsync(data);
            Alert.alert('Copied!', 'Scanned data copied to clipboard.');
            setHasScanned(false);
          },
        },
        {
          text: 'Open Website',
          onPress: () => {
            openWebsite(data);
            setHasScanned(false);
          },
        },
      ]
    );
  };

  const openWebsite = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  return (
    <Camera
      style={{ flex: 1 }}
      type={type}
      ref={cameraRef}
      ratio={cameraRatio}
      onBarCodeScanned={handleBarCodeScanned}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          style={{
            flex: 0.2,
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(102, 102, 102, 0.5)",
            marginBottom: 40,
            marginLeft: 20,
          }}
          onPress={() => {
            setType(
              type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
          }}
        >
          <Text style={{ fontSize: 30, padding: 10, color: "white" }}>♻</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 0.2,
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(102, 102, 102, 0.5)",
            marginBottom: 40,
            marginLeft: 20,
          }}
          onPress={async () => {
            if (cameraRef.current) {
              let photo = await cameraRef.current.takePictureAsync({
                quality: 1.0
              });
              setLastPhotoURI(photo.uri);
            }
          }}
        >
          <Text style={{ fontSize: 30, padding: 10, color: "white" }}>📸</Text>
        </TouchableOpacity>
      </View>
    </Camera>
  );
}
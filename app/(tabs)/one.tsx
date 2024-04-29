import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useRootNavigationState, Redirect } from 'expo-router';

export default function TabOneScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Reverse geocoding to get the address details
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        setAddress(`${geocode[0].city}, ${geocode[0].country}`);
      } catch (error) {
        console.error('Error fetching address:', error);
        setAddress('Address not available');
      }
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      {address && <Text><Text style={styles.addressTextTitle}>You are currently in:</Text> <Text style={styles.addressText}>{address}</Text></Text>}
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addressText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
    color: 'cyan',
  },
  addressTextTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  map: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
});
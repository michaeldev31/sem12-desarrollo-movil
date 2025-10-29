import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [shakeDetected, setShakeDetected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let current = await Location.getCurrentPositionAsync({});
      setLocation(current);
      setLastUpdate(new Date().toLocaleTimeString());
    })();

    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      setLastUpdate(new Date().toLocaleTimeString());
      const { x, y } = accelerometerData;
      if (Math.abs(x) > 1.5 || Math.abs(y) > 1.5) {
        if (!shakeDetected) {
          setShakeDetected(true);
          Alert.alert('Movimiento brusco detectado ');

          setTimeout(() => setShakeDetected(false), 3000);
        }
      }
      return () => subscription && subscription.remove();
    });


  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensores del Dispositivo</Text>

      {location ? (
        <>
          <Text>Latitud: {location.coords.latitude.toFixed(4)}</Text>
          <Text>Longitud: {location.coords.longitude.toFixed(4)}</Text>
          <Text>Velocidad Actual: {(location.coords.speed ?? 0).toFixed(4)}</Text>
        </>
      ) : (
        <Text>Obteniendo ubicación...</Text>
      )}
      <Text style={{ marginTop: 20 }}>
        Acelerómetro - x: {data.x.toFixed(2)} |  y: {data.y.toFixed(2)} z: {data.z.toFixed(2)}
      </Text>

      {shakeDetected && (
        <Text style={styles.alertText}>Movimiento brusco detectado</Text>
      )}

      <Text style={styles.timeText}>
        Ultima lectura: {lastUpdate}
      </Text>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    marginTop: 10,
    color: 'red',
  },
  alertText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  timeText: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
  },
});

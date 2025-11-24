import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function QRCodePresenceScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState('Scannez un QR code');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;

    let parsedData = null;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      setMessage('QR Code invalide ❌');
      setScanned(true);
      return;
    }

    if (!parsedData.id || !parsedData.nom) {
      setMessage('QR Code invalide: id ou nom manquant ❌');
      setScanned(true);
      return;
    }

    // Send presence to backend
    try {
      const response = await fetch(
        'https://presence-backend-8clt.onrender.com/api/presence/scan',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parsedData.id,
            timestamp: Date.now(),
          }),
        }
      );
      if (response.ok) {
        setMessage('Présence validée ✔️');
      } else {
        setMessage('Erreur serveur ❌');
      }
    } catch (error) {
      setMessage('Erreur de connexion ❌');
    }
    setScanned(true);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Demande de permission caméra...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Pas de permission pour accéder à la caméra</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{message}</Text>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={styles.scanner}
        type={BarCodeScanner.Constants.Type.back}
      />
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button
            title="Scanner à nouveau"
            onPress={() => {
              setScanned(false);
              setMessage('Scannez un QR code');
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  header: {
    textAlign: 'center',
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanner: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
});

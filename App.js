import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GameScreen from './src/GameScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameScreen />
    </SafeAreaProvider>
  );
}

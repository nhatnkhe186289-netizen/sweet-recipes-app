import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform, View, StyleSheet } from 'react-native';

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={isWeb ? styles.webBackground : styles.container}>
      <View style={isWeb ? styles.webContainer : styles.container}>
        <Provider store={store}>
          <SafeAreaProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </SafeAreaProvider>
        </Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webBackground: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 428, // Kích thước của iPhone Pro Max
    backgroundColor: '#fff',
    overflow: 'hidden',
    // Đổ bóng cho viền điện thoại
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  }
});

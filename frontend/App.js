import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

const linking = {
  prefixes: ['http://localhost:8081', 'sweetrecipes://'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Auth: {
        path: 'auth',
        screens: {
          SignIn: 'signin',
          SignUp: 'signup',
          ForgotPassword: 'forgot-password',
        },
      },
      App: {
        path: '',
        screens: {
          Home: 'home',
          Search: 'search',
          Favorites: 'favorites',
          Profile: 'profile',
        },
      },
      RecipeDetail: 'recipe/:recipeId',
      AddRecipe: 'add-recipe',
      EditRecipe: 'edit-recipe/:recipeId',
      Comments: 'recipe/:recipeId/comments',
      Settings: 'settings',
      ChangePassword: 'change-password',
    },
  },
};

export default function App() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const showWebWrapper = isWeb && width > 600;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          {showWebWrapper ? (
            <View style={styles.webWrapper}>
              <View style={styles.webContainer}>
                <AppNavigator />
              </View>
            </View>
          ) : (
            <AppNavigator />
          )}
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#FFF0F2', // Matching soft pink background
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    width: 600,
    height: '100%',
    backgroundColor: '#FFF',
    // Add shadow
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  }
});

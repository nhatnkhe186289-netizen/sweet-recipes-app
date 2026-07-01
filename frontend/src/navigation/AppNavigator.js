import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { loadProfile } from '../store/authSlice';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import AddRecipeScreen from '../screens/recipe/AddRecipeScreen';
import EditRecipeScreen from '../screens/recipe/EditRecipeScreen';
import CommentsScreen from '../screens/comments/CommentsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [checkingToken, setCheckingToken] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const result = await dispatch(loadProfile());
          if (loadProfile.fulfilled.match(result)) {
            setInitialRoute('App');
          } else {
            setInitialRoute('Auth');
          }
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setInitialRoute('Onboarding');
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [dispatch]);

  if (checkingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.dark,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="App" component={TabNavigator} options={{ headerShown: false }} />
      
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Chi tiết công thức' }} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Thêm công thức' }} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Chỉnh sửa công thức' }} />
      <Stack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Bình luận' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { loadProfile } from '../store/authSlice';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import RecipeDetailScreen from '../screens/recipe/RecipeDetailScreen';
import AddRecipeScreen from '../screens/recipe/AddRecipeScreen';
import EditRecipeScreen from '../screens/recipe/EditRecipeScreen';
import CommentsScreen from '../screens/comments/CommentsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AuthorProfileScreen from '../screens/profile/AuthorProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ShoppingListScreen from '../screens/shopping/ShoppingListScreen';
import BakingTimerScreen from '../screens/timer/BakingTimerScreen';
import MealPlannerScreen from '../screens/recipe/MealPlannerScreen';
import IngredientChecklistScreen from '../screens/recipe/IngredientChecklistScreen';
import CookingModeScreen from '../screens/recipe/CookingModeScreen';
import AdminDashboardScreen from '../screens/profile/AdminDashboardScreen';
import ManageAccountsScreen from '../screens/profile/ManageAccountsScreen';
import CookingScreen from '../screens/recipe/CookingScreen';
import FollowConnectionsScreen from '../screens/profile/FollowConnectionsScreen';
import NutritionTrackerScreen from '../screens/profile/NutritionTrackerScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkOnboardingAndAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');

        if (token) {
          try {
            await dispatch(loadProfile()).unwrap();
            setInitialRoute('App');
            return;
          } catch (e) {
            await AsyncStorage.removeItem('token');
          }
        }

        if (hasSeen === 'true') {
          setInitialRoute('Auth');
        } else {
          setInitialRoute('Onboarding');
        }
      } catch (error) {
        setInitialRoute('Onboarding');
      }
    };
    checkOnboardingAndAuth();
  }, [dispatch]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
      
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Add Recipe' }} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Edit Recipe' }} />
      <Stack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Comments' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chỉnh sửa hồ sơ' }} />
      <Stack.Screen name="AuthorProfile" component={AuthorProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Thông báo', headerShown: false }} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{ title: 'Danh sách Đi chợ' }} />
      <Stack.Screen name="BakingTimer" component={BakingTimerScreen} options={{ title: 'Clock Timer' }} />
      
      <Stack.Screen name="MealPlanner" component={MealPlannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IngredientChecklist" component={IngredientChecklistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CookingMode" component={CookingModeScreen} options={{ headerShown: false }} />
      
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Kiểm duyệt công thức' }} />
      <Stack.Screen name="ManageAccounts" component={ManageAccountsScreen} options={{ title: 'Quản lý tài khoản' }} />
      <Stack.Screen name="Cooking" component={CookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FollowConnections" component={FollowConnectionsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NutritionTracker" component={NutritionTrackerScreen} options={{ title: 'Theo dõi dinh dưỡng' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

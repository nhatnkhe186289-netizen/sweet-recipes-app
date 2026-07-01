import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
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

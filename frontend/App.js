import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform, View, StyleSheet, useWindowDimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlarmOverlayModal from './src/components/AlarmOverlayModal';

const navigationRef = createNavigationContainerRef();

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

const AlarmManagerWrapper = ({ children }) => {
  const { plans } = useSelector((state) => state.mealPlan || {});
  const [activeAlarm, setActiveAlarm] = useState(null);

  useEffect(() => {
    const checkAlarms = async () => {
      if (activeAlarm) return;

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;

      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hh}:${mm}`;

      const todayPlans = (plans || []).filter((p) => p.date === todayStr);

      for (const plan of todayPlans) {
        if (!plan.time || !plan.recipe) continue;

        if (plan.time === currentTimeStr) {
          const statusStr = await AsyncStorage.getItem(`alarm_${plan._id}`);
          const status = statusStr
            ? JSON.parse(statusStr)
            : { confirmed: false, notifiedCount: 0, lastNotifiedAt: 0 };

          if (status.confirmed) continue;
          if (status.notifiedCount >= 3) continue;

          // Check if 15 minutes have passed since last alarm
          const timeSinceLastAlarm = Date.now() - status.lastNotifiedAt;
          if (status.lastNotifiedAt > 0 && timeSinceLastAlarm < 15 * 60 * 1000) {
            continue;
          }

          // Trigger alarm
          setActiveAlarm({
            planId: plan._id,
            recipeTitle: plan.recipe.title,
            recipe: plan.recipe,
            todayStr,
          });
          break;
        }
      }
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [plans, activeAlarm]);

  const handleConfirm = async () => {
    if (!activeAlarm) return;
    const planId = activeAlarm.planId;
    const todayStr = activeAlarm.todayStr;

    const statusStr = await AsyncStorage.getItem(`alarm_${planId}`);
    const status = statusStr
      ? JSON.parse(statusStr)
      : { confirmed: false, notifiedCount: 0, lastNotifiedAt: 0 };

    const updated = {
      confirmed: true,
      notifiedCount: status.notifiedCount + 1,
      lastNotifiedAt: Date.now(),
    };

    await AsyncStorage.setItem(`alarm_${planId}`, JSON.stringify(updated));
    const title = activeAlarm.recipeTitle;
    setActiveAlarm(null);

    Alert.alert(
      '📅 Đã xác nhận!',
      `Bạn có muốn đi tới phần chuẩn bị nguyên liệu cho món "${title}" không?`,
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Chuẩn bị ngay',
          onPress: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('IngredientChecklist', { dateString: todayStr });
            }
          },
        },
      ]
    );
  };

  const handleDismiss = async () => {
    if (!activeAlarm) return;
    const planId = activeAlarm.planId;

    const statusStr = await AsyncStorage.getItem(`alarm_${planId}`);
    const status = statusStr
      ? JSON.parse(statusStr)
      : { confirmed: false, notifiedCount: 0, lastNotifiedAt: 0 };

    const updated = {
      confirmed: false,
      notifiedCount: status.notifiedCount + 1,
      lastNotifiedAt: Date.now(),
    };

    await AsyncStorage.setItem(`alarm_${planId}`, JSON.stringify(updated));
    setActiveAlarm(null);
  };

  return (
    <>
      {children}
      <AlarmOverlayModal
        visible={!!activeAlarm}
        recipeTitle={activeAlarm?.recipeTitle || ''}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
      />
    </>
  );
};

import CustomAlert from './src/components/CustomAlert';
import { useRef } from 'react';

// Inside App function:
export default function App() {
  const isWeb = Platform.OS === 'web';
  const alertRef = useRef(null);

  return (
    <View style={isWeb ? styles.webBackground : styles.container}>
      <View style={isWeb ? styles.webContainer : styles.container}>
        <Provider store={store}>
          <AlarmManagerWrapper>
            <SafeAreaProvider>
              <NavigationContainer ref={navigationRef} linking={linking} documentTitle={{ formatter: () => 'Sweet Recipes' }}>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </SafeAreaProvider>
          </AlarmManagerWrapper>
        </Provider>
        <CustomAlert ref={alertRef} />
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

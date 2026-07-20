import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList, Platform, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import recipeService from '../../services/recipe.service';
import { fetchRecipes } from '../../store/recipeSlice';
import { addItems } from '../../store/shoppingListSlice';
import { addMealPlan, fetchMealPlans } from '../../store/mealPlanSlice';
import FavoriteButton from '../../components/FavoriteButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import { confirmAction } from '../../utils/alert';

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getNextDays = (count) => {
  const list = [];
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    list.push({
      dateString: formatDateString(d),
      dayLabel: d.getDate(),
      weekday: weekdays[d.getDay()],
      isToday: i === 0,
      fullDate: d,
    });
  }
  return list;
};

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const dispatch = useDispatch();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedPlanDate, setSelectedPlanDate] = useState(formatDateString(new Date()));
  const [selectedHour, setSelectedHour] = useState(() => {
    const hr = new Date().getHours() + 1;
    return String(hr % 24).padStart(2, '0');
  });
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { plans = [] } = useSelector((state) => state.mealPlan || {});

  const toggleIngredient = (idx) => {
    if (checkedIngredients.includes(idx)) {
      setCheckedIngredients(checkedIngredients.filter((i) => i !== idx));
    } else {
      setCheckedIngredients([...checkedIngredients, idx]);
    }
  };

  useEffect(() => {
    const loadRecipeDetails = async () => {
      try {
        const data = await recipeService.getRecipeById(recipeId);
        setRecipe(data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết công thức bánh.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadRecipeDetails();
    dispatch(fetchMealPlans());
  }, [recipeId, dispatch]);

  const handleDelete = () => {
    confirmAction(
      'Xóa công thức',
      'Bạn có chắc chắn muốn xóa vĩnh viễn công thức bánh này không?',
      async () => {
        try {
          await recipeService.deleteRecipe(recipeId);
          Alert.alert('Thành công', 'Đã xóa công thức bánh thành công.');
          dispatch(fetchRecipes());
          navigation.goBack();
        } catch (error) {
          Alert.alert('Lỗi', error.message || 'Không thể xóa công thức bánh.');
        }
      }
    );
  };

  const handleSavePlan = async () => {
    if (!selectedPlanDate) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày nấu ăn.');
      return;
    }

    // Validate real-time constraints for today
    const now = new Date();
    const todayStr = formatDateString(now);
    if (selectedPlanDate === todayStr) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const selHourInt = parseInt(selectedHour);
      const selMinInt = parseInt(selectedMinute);

      if (selHourInt < currentHour || (selHourInt === currentHour && selMinInt <= currentMin)) {
        Alert.alert('Thời gian không hợp lệ', 'Bạn không thể lên kế hoạch nấu ăn vào thời gian đã qua trong ngày hôm nay. Vui lòng chọn giờ trong tương lai!');
        return;
      }
    }
    
    const timeStr = `${selectedHour}:${selectedMinute}`;

    console.log('=== DEBUG DUPLICATE CHECK ===');
    console.log('recipeId:', recipeId);
    console.log('selectedPlanDate:', selectedPlanDate);
    console.log('plans length:', plans.length);
    plans.forEach((p, idx) => {
      const pRecipeId = p.recipe && typeof p.recipe === 'object' ? p.recipe._id : p.recipe;
      console.log(`Plan #${idx}: date=${p.date}, recipeId=${pRecipeId}, matchDate=${p.date === selectedPlanDate}, matchRecipe=${String(pRecipeId) === String(recipeId)}`);
    });

    // Check if duplicate plan for this recipe on this date exists
    const alreadyPlanned = plans.some((p) => {
      const pRecipeId = p.recipe && typeof p.recipe === 'object' ? p.recipe._id : p.recipe;
      return p.date === selectedPlanDate && String(pRecipeId) === String(recipeId);
    });

    const executeSave = async () => {
      setIsSavingPlan(true);
      try {
        await dispatch(
          addMealPlan({
            recipeId: recipe._id,
            date: selectedPlanDate,
            time: timeStr,
          })
        ).unwrap();
        
        setShowDatePickerModal(false);
        Alert.alert('Thành công', 'Đã thêm món bánh này vào kế hoạch nấu ăn! 📅');
        navigation.navigate('App', { screen: 'Home' });
      } catch (err) {
        Alert.alert('Lỗi', err || 'Không thể lên kế hoạch nấu ăn.');
      } finally {
        setIsSavingPlan(false);
      }
    };

    if (alreadyPlanned) {
      if (Platform.OS === 'web') {
        const confirmSave = window.confirm(
          'Bạn đã lập kế hoạch cho loại bánh này hôm nay. Bạn có chắc chắn muốn lập kế hoạch với loại bánh này nữa không?'
        );
        if (confirmSave) {
          executeSave();
        } else {
          setShowDatePickerModal(false);
          navigation.goBack();
        }
      } else {
        Alert.alert(
          'Lập kế hoạch trùng lặp',
          'Bạn đã lập kế hoạch cho loại bánh này hôm nay. Bạn có chắc chắn muốn lập kế hoạch với loại bánh này nữa không?',
          [
            {
              text: 'Hủy',
              style: 'cancel',
              onPress: () => {
                setShowDatePickerModal(false);
                navigation.goBack();
              }
            },
            { text: 'Xác nhận', onPress: executeSave },
          ]
        );
      }
    } else {
      executeSave();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this delicious recipe: ${recipe.title}\n\n${recipe.description}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleAuthorPress = () => {
    if (recipe.author) {
      Alert.alert(
        `Giới thiệu về ${recipe.author.username}`,
        recipe.author.bio || 'Passionate home baker 🍰 Sharing sweet moments, one recipe at a time ✨'
      );
    }
  };

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const isAuthor = user && recipe.author && user._id === recipe.author._id;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        
        {/* Favorite Icon Overlay container */}
        <View style={styles.actionRow}>
          <Text style={styles.category}>{(recipe.category && recipe.category.name) || 'Sweet Dessert'}</Text>
          <View style={styles.rightActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={24} color={colors.dark} />
            </TouchableOpacity>
            <FavoriteButton recipeId={recipe._id} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{recipe.title}</Text>
          {/* Author Info */}
          <TouchableOpacity 
            style={styles.authorRow}
            onPress={() => navigation.navigate('AuthorProfile', { authorId: recipe.author._id })}
          >
            <Image
              source={{ uri: (recipe.author && recipe.author.avatar) || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>By {recipe.author ? recipe.author.username : 'Anonymous'}</Text>
          </TouchableOpacity>

          {/* Quick Info Grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridVal}>{recipe.cookingTime} phút</Text>
              <Text style={styles.gridLbl}>phút</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridVal}>{recipe.calories} kcal</Text>
              <Text style={styles.gridLbl}>kcal</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridVal}>{recipe.difficulty === 'Easy' ? 'Dễ' : recipe.difficulty === 'Medium' ? 'Trung bình' : recipe.difficulty === 'Hard' ? 'Khó' : recipe.difficulty}</Text>
              <Text style={styles.gridLbl}>Độ khó</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{recipe.description}</Text>

          {/* Ingredients */}

            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF0F0',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
              onPress={() => {
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                  dispatch(addItems({ items: recipe.ingredients, recipeTitle: recipe.title }));
                  navigation.navigate('ShoppingList');
                }
              }}
            >
              <Ionicons name="cart-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, marginLeft: 4 }}>
                + Thêm vào Đi chợ
              </Text>
            </TouchableOpacity>
          </View>
          {recipe.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.listItem}>• {ing}</Text>
          ))}

          {/* Instructions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Hướng dẫn thực hiện</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F0F7FF',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
              }}
              onPress={() => navigation.navigate('BakingTimer')}
            >
              <Ionicons name="timer-outline" size={16} color="#007AFF" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#007AFF', marginLeft: 4 }}>
                ⏱️ Clock Timer
              </Text>
            </TouchableOpacity>
          </View>
          {recipe.instructions.map((inst, idx) => (
            <Text key={idx} style={styles.listItem}>{idx + 1}. {inst}</Text>
          ))}

          {/* Buttons */}
          <Button
            title="💬 Xem bình luận"
  },
});

export default RecipeDetailScreen;

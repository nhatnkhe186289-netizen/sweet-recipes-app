import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMealPlans } from '../../store/mealPlanSlice';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const rawWidth = Dimensions.get('window').width;
const width = Platform.OS === 'web' ? Math.min(rawWidth, 600) : rawWidth;

const formatDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseIngredient = (str) => {
  if (!str || typeof str !== 'string') return { quantity: 1, unit: '', name: '' };
  let cleanStr = str.trim().replace(/^[•\-\*\s]+/, '').trim();
  
  // Regex to match quantity at the start: numbers, decimals, fractions
  const qtyRegex = /^(\d+[\s\/\d\.]*|\d+\.\d+|\d+)\s*/;
  const matchQty = cleanStr.match(qtyRegex);
  
  let quantity = 0;
  let unit = '';
  let name = cleanStr;
  
  if (matchQty) {
    const qtyStr = matchQty[1].trim();
    if (qtyStr.includes('/')) {
      const parts = qtyStr.split(/\s+/);
      if (parts.length === 2) {
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split('/');
        quantity = whole + (parseFloat(fracParts[0]) / parseFloat(fracParts[1]));
      } else {
        const fracParts = qtyStr.split('/');
        quantity = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
      }
    } else {
      quantity = parseFloat(qtyStr);
    }
    
    let remainder = cleanStr.substring(matchQty[0].length).trim();
    
    const units = [
      'muỗng cà phê', 'muỗng canh', 'thìa cà phê', 'thìa canh', 'lòng đỏ trứng gà',
      'lòng trắng trứng gà', 'lòng đỏ trứng', 'lòng trắng trứng',
      'gram', 'mililit', 'chiếc', 'quả', 'hộp', 'lon', 'chén', 'cái', 'lát', 'nhúm',
      'ống', 'g', 'ml', 'kg', 'tsp', 'tbsp', 'cup', 'cups', 'lát', 'nhúm'
    ];
    units.sort((a, b) => b.length - a.length);
    
    let matchedUnit = '';
    for (const u of units) {
      if (remainder.toLowerCase().startsWith(u + ' ') || remainder.toLowerCase() === u) {
        matchedUnit = u;
        remainder = remainder.substring(u.length).trim();
        break;
      }
    }
    
    unit = matchedUnit;
    name = remainder;
  }
  
  return {
    quantity: quantity || 1,
    unit: unit || '',
    name: name,
  };
};

const ShoppingListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { plans = [], isLoading = false } = useSelector((state) => state.mealPlan || {});
  const [activeTab, setActiveTab] = useState('TodayTomorrow'); // TodayTomorrow, ThisWeek, All
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    dispatch(fetchMealPlans());
    loadCheckedItems();
  }, [dispatch]);

  const loadCheckedItems = async () => {
    try {
      const saved = await AsyncStorage.getItem('shopping_list_checked');
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading checked shopping list items:', error);
    }
  };

  const toggleCheckedItem = async (key) => {
    const updated = {
      ...checkedItems,
      [key]: !checkedItems[key],
    };
    setCheckedItems(updated);
    try {
      await AsyncStorage.setItem('shopping_list_checked', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving checked shopping list items:', error);
    }
  };

  const clearCheckedItems = async () => {
    setCheckedItems({});
    try {
      await AsyncStorage.removeItem('shopping_list_checked');
    } catch (error) {
      console.error('Error clearing shopping list checked items:', error);
    }
  };

  // Filter plans based on selected date range tab
  const getFilteredPlans = () => {
    const today = new Date();
    const todayStr = formatDateString(today);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateString(tomorrow);
    
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    
    return plans.filter((plan) => {
      if (activeTab === 'TodayTomorrow') {
        return plan.date === todayStr || plan.date === tomorrowStr;
      } else if (activeTab === 'ThisWeek') {
        const planDate = new Date(plan.date);
        const start = new Date(todayStr);
        const end = new Date(formatDateString(weekLater));
        return planDate >= start && planDate < end;
      } else {
        // 'All'
        return true;
      }
    });
  };

  const filteredPlans = getFilteredPlans();

  // Aggregate ingredients
  const getAggregatedIngredients = () => {
    const allIngredients = [];
    filteredPlans.forEach((plan) => {
      if (plan.recipe && plan.recipe.ingredients) {
        plan.recipe.ingredients.forEach((ing) => {
          allIngredients.push(ing);
        });
      }
    });

    const map = {};
    allIngredients.forEach((str) => {
      const parsed = parseIngredient(str);
      const normName = parsed.name.toLowerCase().trim();
      const normUnit = parsed.unit.toLowerCase().trim();
      
      const key = `${normName}_${normUnit}`;

      if (map[key]) {
        map[key].quantity += parsed.quantity;
      } else {
        map[key] = {
          name: parsed.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          key,
        };
      }
    });

    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  };

  const ingredients = getAggregatedIngredients();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh Sách Đi Chợ</Text>
        <TouchableOpacity onPress={clearCheckedItems} style={styles.clearButton}>
          <Text style={styles.clearText}>Xóa chọn</Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'TodayTomorrow' && styles.activeTab]}
          onPress={() => setActiveTab('TodayTomorrow')}
        >
          <Text style={[styles.tabText, activeTab === 'TodayTomorrow' && styles.activeTabText]}>
            Hôm nay & Mai
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ThisWeek' && styles.activeTab]}
          onPress={() => setActiveTab('ThisWeek')}
        >
          <Text style={[styles.tabText, activeTab === 'ThisWeek' && styles.activeTabText]}>
            7 ngày tới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>Không tìm thấy món bánh nào đã lên lịch.</Text>
            <Text style={styles.emptySub}>
              Hãy lên lịch cho các món bánh ngọt ở màn hình Meal Planner trước để tự động gộp nguyên liệu đi chợ nhé.
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Cần mua ({ingredients.length} nguyên liệu)</Text>
              <Text style={styles.listSubtitle}>Gộp từ {filteredPlans.length} kế hoạch nấu</Text>
            </View>

            {ingredients.map((item) => {
              const isChecked = !!checkedItems[item.key];
              // Format quantity (e.g. 1.5 -> 1.5, 2.0 -> 2)
              const formattedQty = Number(item.quantity.toFixed(2));
              
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.itemRow, isChecked && styles.itemRowChecked]}
                  onPress={() => toggleCheckedItem(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </View>
                    <Text style={[styles.itemName, isChecked && styles.itemNameChecked]}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={[styles.itemQty, isChecked && styles.itemQtyChecked]}>
                    {formattedQty} {item.unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: colors.light,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
    lineHeight: 18,
  },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  listHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 14,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
  },
  listSubtitle: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAF9',
  },
  itemRowChecked: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  itemQtyChecked: {
    color: colors.grey,
  },
});

export default ShoppingListScreen;

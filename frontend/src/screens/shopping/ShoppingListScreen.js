import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchShoppingList,
  addItems,
  toggleItemBought,
  deleteItem,
  clearAllItems,
} from '../../store/shoppingListSlice';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}: ${msg}`);
  } else {
    Alert.alert(title, msg);
  }
};

const ShoppingListScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();

  const { items, isLoading } = useSelector((state) => state.shoppingList);

  useEffect(() => {
    dispatch(fetchShoppingList());
  }, [dispatch]);

  const handleAddItem = () => {
    if (!name.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập tên nguyên liệu');
      return;
    }
    dispatch(addItems({ name: name.trim(), amount: amount.trim() }));
    setName('');
    setAmount('');
  };

  const handleToggle = (id) => {
    dispatch(toggleItemBought(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteItem(id));
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách đi chợ?')) {
        dispatch(clearAllItems());
      }
    } else {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc chắn muốn xóa toàn bộ danh sách đi chợ?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa tất cả', style: 'destructive', onPress: () => dispatch(clearAllItems()) },
        ]
      );
    }
  };

  const boughtCount = items.filter((i) => i.isBought).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, item.isBought && styles.itemCardBought]}>
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={() => handleToggle(item._id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.isBought ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.isBought ? colors.primary : colors.grey}
        />
      </TouchableOpacity>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, item.isBought && styles.itemNameBought]}>
          {item.name}
        </Text>
        {item.amount ? (
          <Text style={[styles.itemAmount, item.isBought && styles.itemAmountBought]}>
            {item.amount}
          </Text>
        ) : null}
        {item.recipeTitle ? (
          <View style={styles.recipeTag}>
            <Ionicons name="book-outline" size={12} color={colors.primary} />
            <Text style={styles.recipeTagText}>{item.recipeTitle}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item._id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Progress Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>🛒 Danh sách Đi chợ</Text>
            <Text style={styles.headerSubtitle}>
              {boughtCount}/{totalCount} nguyên liệu đã mua ({progressPercent}%)
            </Text>
          </View>
          {totalCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Ionicons name="trash-bin-outline" size={16} color="#FF4D4D" />
              <Text style={styles.clearText}>Xóa hết</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Manual Input Form */}
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Tên nguyên liệu (VD: Bột mì)"
            placeholderTextColor={colors.grey}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="Số lượng (200g)"
            placeholderTextColor={colors.grey}
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Shopping List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={64} color={colors.grey} />
              <Text style={styles.emptyTitle}>Danh sách đang trống</Text>
              <Text style={styles.emptySubtitle}>
                Thêm nguyên liệu thủ công ở trên hoặc nhấn nút "Thêm vào danh sách đi chợ" trong bài viết công thức!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  headerCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.grey,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  clearText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0E8E8',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  inputCard: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FDF7F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.dark,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  itemCardBought: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7,
  },
  checkboxTouch: {
    paddingRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark,
  },
  itemNameBought: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
  itemAmount: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  itemAmountBought: {
    textDecorationLine: 'line-through',
    color: colors.grey,
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recipeTagText: {
    fontSize: 11,
    color: colors.grey,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.grey,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});

export default ShoppingListScreen;

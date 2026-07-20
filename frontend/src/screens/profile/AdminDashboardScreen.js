import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchAdminRecipes, changeRecipeStatus } from '../../store/adminSlice';
import { fetchRecipes } from '../../store/recipeSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import alertService from '../../services/alertService';

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { recipes, isLoading } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'

  useEffect(() => {
    dispatch(fetchAdminRecipes());
  }, [dispatch]);

  const handleUpdateStatus = (recipeId, newStatus, title) => {
    const actionText = newStatus === 'approved' ? 'Duyệt bài' : 'Từ chối';
    const performUpdate = () => {
      dispatch(changeRecipeStatus({ recipeId, status: newStatus }))
        .unwrap()
        .then(() => {
          Alert.alert('Thành công', `Đã ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} công thức: ${title}`);
          dispatch(fetchRecipes()); // Refresh general list
        })
        .catch((err) => {
          Alert.alert('Lỗi', err || 'Không thể cập nhật trạng thái.');
        });
    };

    alertService.confirm(
      actionText,
      `Bạn có chắc chắn muốn ${actionText.toLowerCase()} "${title}"?`,
      performUpdate,
      null,
      actionText,
      'Hủy'
    );
  };

  const filteredRecipes = recipes.filter((r) => r.status === activeTab);

  const renderRecipeItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.recipeImg} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.authorRow}>
            <Image
              source={{ uri: item.author?.avatar || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
              style={styles.avatar}
            />
            <Text style={styles.authorName}>{item.author?.username || 'Ẩn danh'}</Text>
          </View>
          
          <Text style={styles.dateText}>
            Đăng ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>

          {activeTab === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.approveBtn]}
                onPress={() => handleUpdateStatus(item._id, 'approved', item.title)}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} />
                <Text style={styles.btnText}>Duyệt bài</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={() => handleUpdateStatus(item._id, 'rejected', item.title)}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.white} />
                <Text style={styles.btnText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'approved' && (
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: '#E0F2F1' }]}>
                <Text style={[styles.badgeText, { color: '#004D40' }]}>Đã phê duyệt</Text>
              </View>
              <TouchableOpacity
                style={styles.revertTextBtn}
                onPress={() => handleUpdateStatus(item._id, 'rejected', item.title)}
              >
                <Text style={styles.revertText}>Từ chối lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'rejected' && (
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
                <Text style={[styles.badgeText, { color: '#C62828' }]}>Đã từ chối</Text>
              </View>
              <TouchableOpacity
                style={styles.revertTextBtn}
                onPress={() => handleUpdateStatus(item._id, 'approved', item.title)}
              >
                <Text style={styles.revertText}>Duyệt lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['pending', 'approved', 'rejected'].map((tab) => {
          const isActive = activeTab === tab;
          let label = 'Chờ duyệt';
          if (tab === 'approved') label = 'Đã duyệt';
          if (tab === 'rejected') label = 'Bị từ chối';

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="documents-outline" size={48} color={colors.grey} />
          <Text style={styles.emptyText}>Không có bài đăng nào ở trạng thái này.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item._id}
          renderItem={renderRecipeItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#FFEBF0',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.grey,
  },
  activeTabText: {
    color: colors.primary,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  recipeImg: {
    width: 90,
    height: 120,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.dark,
  },
  desc: {
    fontSize: 12,
    color: colors.grey,
    marginVertical: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  authorName: {
    fontSize: 11,
    color: colors.dark,
    marginLeft: 6,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 10,
    color: colors.grey,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  approveBtn: {
    backgroundColor: '#00897B',
  },
  rejectBtn: {
    backgroundColor: colors.error,
  },
  btnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  revertTextBtn: {
    padding: 4,
  },
  revertText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;

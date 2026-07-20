import React, { useEffect } from 'react';
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
import { fetchAdminUsers, changeUserRole, changeUserStatus, deleteUserAccount } from '../../store/adminSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import alertService from '../../services/alertService';

const ManageAccountsScreen = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleToggleRole = (userId, currentRole, username) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    const performToggle = () => {
      dispatch(changeUserRole({ userId, role: nextRole }))
        .unwrap()
        .then(() => {
          Alert.alert('Thành công', `Đã chuyển vai trò của ${username} thành ${nextRole.toUpperCase()}`);
        })
        .catch((err) => {
          Alert.alert('Lỗi', err || 'Không thể thay đổi vai trò.');
        });
    };

    alertService.confirm(
      'Đổi vai trò',
      `Bạn có chắc muốn đổi vai trò của ${username} thành ${nextRole.toUpperCase()}?`,
      performToggle
    );
  };

  const handleToggleStatus = (userId, currentStatus, username) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const actionText = nextStatus === 'blocked' ? 'Khóa tài khoản' : 'Kích hoạt lại';
    const performToggle = () => {
      dispatch(changeUserStatus({ userId, status: nextStatus }))
        .unwrap()
        .then(() => {
          Alert.alert('Thành công', `Đã cập nhật trạng thái của ${username} thành ${nextStatus === 'blocked' ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}`);
        })
        .catch((err) => {
          Alert.alert('Lỗi', err || 'Không thể cập nhật trạng thái.');
        });
    };

    alertService.confirm(
      actionText,
      `Bạn có chắc muốn ${actionText.toLowerCase()} của ${username}?`,
      performToggle
    );
  };

  const handleDeleteUser = (userId, username) => {
    const performDelete = () => {
      dispatch(deleteUserAccount(userId))
        .unwrap()
        .then(() => {
          Alert.alert('Thành công', `Đã xóa tài khoản của ${username}`);
        })
        .catch((err) => {
          Alert.alert('Lỗi', err || 'Không thể xóa tài khoản.');
        });
    };

    alertService.confirm(
      'Xóa tài khoản',
      `Hành động này sẽ xóa vĩnh viễn tài khoản của ${username} và toàn bộ bài đăng của họ. Bạn có chắc chắn muốn tiếp tục?`,
      performDelete,
      null,
      'Xóa tài khoản',
      'Hủy'
    );
  };

  const renderUserItem = ({ item }) => {
    const isBlocked = item.status === 'blocked';
    const isAdmin = item.role === 'admin';

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.avatar || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{item.username}</Text>
            <View style={[styles.badge, isAdmin ? styles.adminBadge : styles.userBadge]}>
              <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.email}>{item.email}</Text>
          
          <View style={styles.statusRow}>
            <View style={styles.statusDotRow}>
              <View style={[styles.statusDot, { backgroundColor: isBlocked ? colors.error : colors.success }]} />
              <Text style={styles.statusText}>{isBlocked ? 'Đã khóa' : 'Hoạt động'}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {/* Toggle Role */}
            <TouchableOpacity
              style={[styles.btn, styles.roleBtn]}
              onPress={() => handleToggleRole(item._id, item.role, item.username)}
            >
              <Ionicons name="swap-horizontal-outline" size={14} color="#3F51B5" />
              <Text style={[styles.btnText, { color: '#3F51B5' }]}>{isAdmin ? 'Làm User' : 'Làm Admin'}</Text>
            </TouchableOpacity>

            {/* Block / Unblock */}
            <TouchableOpacity
              style={[styles.btn, isBlocked ? styles.unblockBtn : styles.blockBtn]}
              onPress={() => handleToggleStatus(item._id, item.status, item.username)}
            >
              <Ionicons
                name={isBlocked ? "lock-open-outline" : "lock-closed-outline"}
                size={14}
                color={isBlocked ? colors.success : colors.error}
              />
              <Text style={[styles.btnText, { color: isBlocked ? colors.success : colors.error }]}>
                {isBlocked ? 'Mở khóa' : 'Khóa'}
              </Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              style={[styles.btn, styles.deleteBtn]}
              onPress={() => handleDeleteUser(item._id, item.username)}
            >
              <Ionicons name="trash-outline" size={14} color={colors.grey} />
              <Text style={[styles.btnText, { color: colors.grey }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={colors.grey} />
          <Text style={styles.emptyText}>Chưa có tài khoản nào khả dụng.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
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
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  email: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: '#E8EAF6',
  },
  userBadge: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.grey,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.grey,
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
    borderWidth: 1,
    gap: 4,
  },
  roleBtn: {
    borderColor: '#E8EAF6',
    backgroundColor: '#F9FAFB',
  },
  blockBtn: {
    borderColor: '#FFEBEE',
    backgroundColor: '#FFEBEE',
  },
  unblockBtn: {
    borderColor: '#E0F2F1',
    backgroundColor: '#E0F2F1',
  },
  deleteBtn: {
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
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

export default ManageAccountsScreen;

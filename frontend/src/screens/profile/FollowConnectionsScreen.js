import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadProfile } from '../../store/authSlice';
import api from '../../services/api';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const FollowConnectionsScreen = ({ route, navigation }) => {
  const { userId, type } = route.params; // type: 'followers' | 'following'
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, [userId, type]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${userId}/${type}`);
      if (response.data.success) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách liên kết.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleFollowToggle = async (targetUser) => {
    if (!currentUser) return;
    
    const isFollowing = currentUser.following?.includes(targetUser._id);
    setActionLoadingId(targetUser._id);

    try {
      if (isFollowing) {
        // Confirm unfollow
        Alert.alert(
          'Bỏ theo dõi',
          `Bạn có chắc chắn muốn bỏ theo dõi ${targetUser.username}?`,
          [
            { text: 'Hủy', style: 'cancel', onPress: () => setActionLoadingId(null) },
            {
              text: 'Bỏ theo dõi',
              style: 'destructive',
              onPress: async () => {
                try {
                  await api.post(`/users/${targetUser._id}/unfollow`);
                  dispatch(loadProfile()); // Update current user's following list in Redux
                } catch (e) {
                  Alert.alert('Lỗi', 'Không thể bỏ theo dõi.');
                } finally {
                  setActionLoadingId(null);
                }
              }
            }
          ]
        );
      } else {
        await api.post(`/users/${targetUser._id}/follow`);
        dispatch(loadProfile()); // Update current user's following list in Redux
        setActionLoadingId(null);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể thực hiện hành động này.');
      setActionLoadingId(null);
    }
  };

  const handleUserPress = (targetUserId) => {
    if (currentUser && currentUser._id === targetUserId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('AuthorProfile', { authorId: targetUserId });
    }
  };

  const renderItem = ({ item }) => {
    const isSelf = currentUser && currentUser._id === item._id;
    const isFollowing = currentUser && currentUser.following?.includes(item._id);
    const isLoading = actionLoadingId === item._id;

    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => handleUserPress(item._id)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.avatar || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.bio} numberOfLines={1}>
            {item.bio || 'Chưa có tiểu sử.'}
          </Text>
        </View>
        
        {!isSelf && currentUser && (
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={() => handleFollowToggle(item)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isFollowing ? colors.primary : colors.white} />
            ) : (
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi'}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.grey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên..."
          placeholderTextColor={colors.grey}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={18} color={colors.grey} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={type === 'followers' ? "people-outline" : "person-add-outline"} 
            size={60} 
            color={colors.grey} 
          />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Danh sách trống.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.dark,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 46,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  clearIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#2B2D42',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 2,
  },
  bio: {
    fontSize: 12,
    color: colors.grey,
  },
  followBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minWidth: 90,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.primary,
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  followingBtnText: {
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default FollowConnectionsScreen;

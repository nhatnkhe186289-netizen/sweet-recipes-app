import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadProfile, logout } from '../../store/authSlice';
import recipeService from '../../services/recipe.service';
import { confirmAction } from '../../utils/alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

import { Platform } from 'react-native';

const { width } = Dimensions.get('window');
const containerWidth = Platform.OS === 'web' ? Math.min(width, 428) : width;
const imageSize = (containerWidth - 48) / 3; // 3 columns with padding

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favoriteIds } = useSelector((state) => state.favorite);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRecipes, setShowAllRecipes] = useState(false);

  useEffect(() => {
    dispatch(loadProfile());
  }, [dispatch]);

  const fetchUserRecipes = async () => {
    try {
      const data = await recipeService.getRecipes({ author: user?._id });
      setUserRecipes(data.filter((r) => r.author?._id === user?._id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRecipes();
    }
  }, [user]);

  // Refetch when focused to capture newly added or updated recipes
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user) {
        fetchUserRecipes();
      }
    });
    return unsubscribe;
  }, [navigation, user]);

  const handleLogout = () => {
    confirmAction(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất tài khoản không?',
      () => {
        dispatch(logout());
        navigation.replace('Auth');
      }
    );
  };

  const displayedRecipes = showAllRecipes ? userRecipes : userRecipes.slice(0, 6);

  const followersCount = user?.followers?.length || 0;
  const followingCount = user?.following?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Cover Background Header */}
        <ImageBackground
          source={{ uri: user?.coverImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' }}
          style={styles.coverHeader}
        >
          <View style={styles.overlay} />
        </ImageBackground>

        {/* Profile Info Overlay */}
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri: user?.avatar || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg',
              }}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.username}>{user ? user.username : 'Emma Rose'}</Text>
          <Text style={styles.handle}>@{user ? user.email.split('@')[0] : 'emmarose_bakes'}</Text>
          <Text style={styles.bio}>
            {user?.bio || 'Passionate home baker 🍰 Sharing sweet moments, one recipe at a time ✨'}
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{userRecipes.length}</Text>
              <Text style={styles.statLabel}>Công thức</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{favoriteIds.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowConnections', { userId: user?._id, type: 'followers' })}
            >
              <Text style={styles.statVal}>{followersCount}</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowConnections', { userId: user?._id, type: 'following' })}
            >
              <Text style={styles.statVal}>{followingCount}</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </TouchableOpacity>
          </View>

          {/* My Recipes Grid */}
          <View style={styles.recipesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.tabText}>Công thức của tôi</Text>
              {userRecipes.length > 6 && (
                <TouchableOpacity onPress={() => setShowAllRecipes(!showAllRecipes)}>
                  <Text style={styles.seeAllText}>
                    {showAllRecipes ? 'Show less' : 'See all'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <LoadingSpinner />
            ) : userRecipes.length === 0 ? (
              <Text style={styles.emptyText}>You haven't posted any sweet recipes yet.</Text>
            ) : (
              <View style={styles.recipeGrid}>
                {displayedRecipes.map((recipe) => {
                  return (
                    <TouchableOpacity
                      key={recipe._id}
                      onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe._id })}
                      style={styles.recipeThumbnail}
                    >
                      <Image 
                        source={{ uri: recipe.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' }} 
                        style={styles.recipeImg} 
                        defaultSource={{ uri: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Action List Section */}
          <View style={styles.actionList}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('EditProfile')}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#FFEBF0' }]}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Chỉnh sửa hồ sơ</Text>
                  <Text style={styles.actionSubtitle}>Update your info & photo</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Favorites')}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#FFF6E3' }]}>
                  <Ionicons name="bookmark-outline" size={18} color="#FFD166" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Saved Collections</Text>
                  <Text style={styles.actionSubtitle}>{favoriteIds.length} recipes saved</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Notifications')}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#F3EFFF' }]}>
                  <Ionicons name="notifications-outline" size={18} color="#8F00FF" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Notifications</Text>
                  <Text style={styles.actionSubtitle}>Manage your alerts</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Settings')}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="settings-outline" size={18} color="#1E88E5" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Cài đặt</Text>
                  <Text style={styles.actionSubtitle}>App preferences</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#FFEBEB' }]}>
                  <Ionicons name="log-out-outline" size={18} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.actionTitle, { color: colors.error }]}>Đăng xuất</Text>
                  <Text style={styles.actionSubtitle}>See you soon! 👋</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  coverHeader: {
    height: 140,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  profileSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -60,
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: colors.white,
  },
  editProfileOutlineBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  username: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
  },
  handle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 8,
  },
  bio: {
    fontSize: 13,
    color: colors.grey,
    lineHeight: 18,
    marginBottom: 20,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDF7F7',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 10,
    color: colors.grey,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#E2E8F0',
  },
  recipesSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  recipeThumbnail: {
    width: imageSize,
    height: imageSize,
    padding: 4,
  },
  recipeImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
  },
  emptyText: {
    color: colors.grey,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionList: {
    marginBottom: 30,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  actionSubtitle: {
    fontSize: 11,
    color: colors.grey,
    marginTop: 2,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
});

export default ProfileScreen;

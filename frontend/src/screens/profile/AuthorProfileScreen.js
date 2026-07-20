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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { loadProfile } from '../../store/authSlice';
import api from '../../services/api';
import colors from '../../theme/colors';
import typography from '../../theme/typography';

import { Platform } from 'react-native';

const { width } = Dimensions.get('window');
const containerWidth = Platform.OS === 'web' ? Math.min(width, 428) : width;
const imageSize = (containerWidth - 48) / 3;

const AuthorProfileScreen = ({ route, navigation }) => {
  const { authorId } = route.params;
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchAuthorData();
  }, [authorId]);

  const fetchAuthorData = async () => {
    try {
      const response = await api.get(`/users/${authorId}`);
      if (response.data.success) {
        setAuthor(response.data.data);
        // Check if current user is following this author
        if (response.data.data.followers && currentUser) {
          setIsFollowing(response.data.data.followers.includes(currentUser._id));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    if (isFollowing) {
      Alert.alert(
        'Bỏ theo dõi',
        `Bạn có chắc chắn muốn bỏ theo dõi ${author.username}?`,
        [
          { text: 'Không', style: 'cancel' },
          { 
            text: 'Bỏ theo dõi', 
            style: 'destructive',
            onPress: executeFollowToggle
          }
        ]
      );
    } else {
      executeFollowToggle();
    }
  };

  const executeFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/users/${authorId}/unfollow`);
        setIsFollowing(false);
        setAuthor(prev => ({ ...prev, followers: prev.followers.filter(id => id !== currentUser._id) }));
      } else {
        await api.post(`/users/${authorId}/follow`);
        setIsFollowing(true);
        setAuthor(prev => ({ ...prev, followers: [...(prev.followers || []), currentUser._id] }));
      }
      dispatch(loadProfile()); // Update current user's following list in Redux
    } catch (error) {
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!author) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy người dùng</Text>
      </View>
    );
  }

  const followersCount = author.followers ? author.followers.length : 0;
  const followingCount = author.following ? author.following.length : 0;
  const recipesCount = author.recipes ? author.recipes.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Cover Background Header */}
        <ImageBackground
          source={{ uri: author.coverImage || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' }}
          style={styles.coverHeader}
        >
          <View style={styles.overlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        </ImageBackground>

        {/* Profile Info Overlay */}
        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri: author.avatar || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg',
              }}
              style={styles.avatar}
            />
            {currentUser && currentUser._id !== authorId && (
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? colors.primary : colors.white} />
                ) : (
                  <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.username}>{author.username}</Text>
          <Text style={styles.handle}>@{author.username.toLowerCase().replace(/\s/g, '')}</Text>
          <Text style={styles.bio}>
            {author.bio || 'Chưa có tiểu sử'}
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{recipesCount}</Text>
              <Text style={styles.statLabel}>Công thức</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowConnections', { userId: authorId, type: 'followers' })}
            >
              <Text style={styles.statVal}>{followersCount}</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => navigation.navigate('FollowConnections', { userId: authorId, type: 'following' })}
            >
              <Text style={styles.statVal}>{followingCount}</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </TouchableOpacity>
          </View>

          {/* Author's Recipes */}
          <View style={styles.recipesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Công thức đã đăng</Text>
            </View>

            {recipesCount === 0 ? (
              <Text style={styles.emptyText}>Người dùng này chưa có công thức nào.</Text>
            ) : (
              <View style={styles.recipeGrid}>
                {author.recipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe._id}
                    onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe._id })}
                    style={styles.recipeThumbnail}
                  >
                    <Image 
                      source={{ uri: recipe.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' }} 
                      style={styles.recipeImg} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
  followBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  followBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  followingBtnText: {
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
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
});

export default AuthorProfileScreen;

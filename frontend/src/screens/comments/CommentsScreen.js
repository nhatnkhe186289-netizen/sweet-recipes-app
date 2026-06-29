import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import commentService from '../../services/comment.service';
import LoadingSpinner from '../../components/LoadingSpinner';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const CommentsScreen = ({ route }) => {
  const { recipeId } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const data = await commentService.getRecipeComments(recipeId);
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [recipeId]);

  const handleAddComment = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await commentService.addComment(recipeId, content.trim());
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng bình luận.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentService.deleteComment(commentId);
              setComments((prev) => prev.filter(c => c._id !== commentId));
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bình luận.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isOwnComment = user && item.userId && user._id === item.userId._id;
          return (
            <View style={styles.commentCard}>
              <Image
                source={{ uri: (item.userId && item.userId.avatar) || 'https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg' }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.userId ? item.userId.username : 'Ẩn danh'}</Text>
                  {isOwnComment && (
                    <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
                      <Text style={styles.deleteText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Viết bình luận..."
          value={content}
          onChangeText={setContent}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={submitting || !content.trim()}
          style={[styles.sendBtn, !content.trim() && styles.disabledSendBtn]}
        >
          <Text style={styles.sendText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  list: {
    padding: spacing.md,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  commentUser: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
    color: colors.dark,
  },
  deleteText: {
    color: colors.error,
    fontSize: typography.sizes.xs,
  },
  commentText: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.grey,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    color: colors.dark,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  disabledSendBtn: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
});

export default CommentsScreen;

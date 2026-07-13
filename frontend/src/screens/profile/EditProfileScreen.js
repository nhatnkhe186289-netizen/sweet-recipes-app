import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../../services/auth.service';
import { loadProfile } from '../../store/authSlice';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');
  const [updating, setUpdating] = useState(false);

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'cover') {
        setCoverImage(result.assets[0].uri);
      } else {
        setAvatar(result.assets[0].uri);
      }
    }
  };

  const getBlobForWeb = async (uri) => {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      // append name for multer
      return new File([blob], 'upload.jpg', { type: blob.type });
    }
    return {
      uri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    };
  };

  const handleUpdate = async () => {
    if (!username) {
      Alert.alert('Lỗi', 'Tên người dùng không được để trống');
      return;
    }

    setUpdating(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      
      if (avatar && avatar !== user?.avatar) {
        if (avatar.startsWith('http') && !avatar.startsWith('blob:')) {
          formData.append('avatar', avatar);
        } else {
          formData.append('avatar', await getBlobForWeb(avatar));
        }
      }

      if (coverImage && coverImage !== user?.coverImage) {
        if (coverImage.startsWith('http') && !coverImage.startsWith('blob:')) {
          formData.append('coverImage', coverImage);
        } else {
          formData.append('coverImage', await getBlobForWeb(coverImage));
        }
      }

      await authService.updateProfile(formData);
      Alert.alert('Thành công', 'Cập nhật hồ sơ cá nhân thành công');
      dispatch(loadProfile());
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể cập nhật hồ sơ cá nhân');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>TÊN NGƯỜI DÙNG</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Update username"
          placeholderTextColor={colors.grey}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>GIỚI THIỆU</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Tell us about yourself..."
          placeholderTextColor={colors.grey}
          multiline
          numberOfLines={3}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>AVATAR</Text>
        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('avatar')}>
          <Text style={styles.imagePickerText}>Chọn ảnh Avatar từ điện thoại</Text>
        </TouchableOpacity>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.previewImage} />
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>COVER IMAGE (BACKGROUND)</Text>
        <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('cover')}>
          <Text style={styles.imagePickerText}>Chọn ảnh Cover từ điện thoại</Text>
        </TouchableOpacity>
        {coverImage ? (
          <Image source={{ uri: coverImage }} style={styles.previewCover} />
        ) : null}
      </View>

      <Button
        title="Lưu thay đổi"
        onPress={handleUpdate}
        loading={updating}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: colors.white,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: '#FDF7F7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
    borderWidth: 0,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 15,
  },
  imagePickerBtn: {
    backgroundColor: '#FFEBF0',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 8,
  },
  previewCover: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
    resizeMode: 'cover',
  }
});

export default EditProfileScreen;

import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import authService from '../../services/auth.service';
import { loadProfile } from '../../store/authSlice';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import styles from '../../css/SettingsScreen.css';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updating, setUpdating] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Chúng tôi cần quyền truy cập thư viện ảnh để tải ảnh lên.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
    }
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

      if (avatar) {
        if (avatar.startsWith('http')) {
          formData.append('avatar', avatar);
        } else {
          formData.append('avatar', {
            uri: avatar,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          });
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
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <Text style={styles.title}>Chỉnh sửa thông tin cá nhân</Text>
      
      {/* Avatar Picker Section */}
      <View style={styles.avatarPickerContainer}>
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
          <Image
            source={{
              uri: avatar || "https://res.cloudinary.com/demo/image/upload/v1622523942/sample.jpg"
            }}
            style={styles.avatarPreview}
          />
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={18} color={colors.white} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.pickImageBtn}>
          <Text style={styles.pickImageBtnText}>Chọn ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>TÊN NGƯỜU DÙNG</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tên người dùng"
          placeholderTextColor={colors.grey}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>TIỂU SỬ</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Viết gì đó về bản thân bạn..."
          placeholderTextColor={colors.grey}
          multiline
          numberOfLines={3}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      <Button
        title="Lưu cài đặt"
        onPress={handleUpdate}
        loading={updating}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

export default SettingsScreen;

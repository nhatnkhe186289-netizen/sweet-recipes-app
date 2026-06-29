import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../../services/auth.service';
import { loadProfile } from '../../store/authSlice';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [updating, setUpdating] = useState(false);

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
      formData.append('avatar', avatar);

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
      <Text style={styles.title}>Edit Profile Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>USERNAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Update username"
          placeholderTextColor={colors.grey}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>BIO</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Write something about yourself..."
          placeholderTextColor={colors.grey}
          multiline
          numberOfLines={3}
          value={bio}
          onChangeText={setBio}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>AVATAR IMAGE URL</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter online image address"
          placeholderTextColor={colors.grey}
          value={avatar}
          onChangeText={setAvatar}
        />
      </View>

      <Button
        title="Save Settings"
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
});

export default SettingsScreen;

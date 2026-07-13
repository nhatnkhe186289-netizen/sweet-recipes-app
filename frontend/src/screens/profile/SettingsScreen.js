import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth.service';
import Button from '../../components/Button';
import colors from '../../theme/colors';

const SettingsScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    setUpdating(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể đổi mật khẩu');
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
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <Text style={styles.sectionTitle}>Bảo mật</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>MẬT KHẨU HIỆN TẠI</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••••••"
          placeholderTextColor={colors.grey}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>MẬT KHẨU MỚI</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••••••"
          placeholderTextColor={colors.grey}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <Button
        title="Đổi mật khẩu"
        onPress={handleUpdatePassword}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backBtn: {
    padding: 8,
    marginRight: 10,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
});

export default SettingsScreen;

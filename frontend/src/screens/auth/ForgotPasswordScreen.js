import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/auth.service';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import styles from '../../css/ForgotPasswordScreen.css';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !username || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email, username và mật khẩu mới');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email, username, newPassword);
      if (response.success) {
        Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi thành công!', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') }
        ]);
      } else {
        Alert.alert('Thất bại', response.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Custom Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Quên mật khẩu 🔒</Text>
        <Text style={styles.subtitle}>Nhập thông tin chi tiết của bạn bên dưới để đặt lại mật khẩu</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="emma@sweetrecipe.com"
            placeholderTextColor={colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>TÊN ĐĂNG NHẬP</Text>
          <TextInput
            style={styles.textInput}
            placeholder="emma_rose"
            placeholderTextColor={colors.grey}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>MẬT KHẨU MỚI</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••••••"
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Đặt lại mật khẩu"
          onPress={handleResetPassword}
          loading={isLoading}
          style={styles.resetButton}
        />

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.link}>Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;

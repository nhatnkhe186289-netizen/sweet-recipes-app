import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { register, reset } from '../../store/authSlice';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';

const { height } = Dimensions.get('window');

const showAlert = (title, msg) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}: ${msg}`);
  } else {
    Alert.alert(title, msg);
  }
};

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) {
      showAlert('Lỗi đăng ký', message || 'Thông tin đăng ký không hợp lệ hoặc email đã tồn tại');
      dispatch(reset());
    }
    if (isSuccess || user) {
      dispatch(reset());
      navigation.replace('App');
    }
  }, [user, isError, isSuccess, message, dispatch, navigation]);

  const handleSignUp = () => {
    if (!username || !email || !password || !confirmPassword) {
      showAlert('Lỗi', 'Vui lòng điền đầy đủ tất cả các trường thông tin');
      return;
    }
    if (password.length < 6) {
      showAlert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu và Xác nhận mật khẩu không khớp');
      return;
    }
    dispatch(register({ username, email, password }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Top Banner Image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800' }}
        style={styles.headerImage}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>★ 4.9 Rated App</Text>
        </View>
      </ImageBackground>

      {/* Form Content */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Tạo tài khoản 👋</Text>
        <Text style={styles.subtitle}>Đăng ký để tham gia cộng đồng của chúng tôi</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>TÊN NGƯỜI DÙNG</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Emma Rose"
            placeholderTextColor={colors.grey}
            autoCapitalize="words"
            autoComplete="username"
            textContentType="username"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="emma@sweetrecipe.com"
            placeholderTextColor={colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>MẬT KHẨU</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••••••"
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              value={password}
              onChangeText={setPassword}
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>XÁC NHẬN MẬT KHẨU</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••••••"
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
          title="Đăng ký"
          onPress={handleSignUp}
          loading={isLoading}
          style={styles.signUpButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.link}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAF5F5',
  },
  headerImage: {
    height: height * 0.3,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  badgeContainer: {
    backgroundColor: '#FFD166',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeText: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -30,
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.dark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF7F7',
    borderRadius: 14,
    borderWidth: 0,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  signUpButton: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: colors.grey,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default SignUpScreen;

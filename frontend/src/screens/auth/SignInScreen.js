import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { login, reset } from "../../store/authSlice";
import authService from '../../services/auth.service';
import Button from "../../components/Button";
import colors from "../../theme/colors";
import typography from "../../theme/typography";
import spacing from "../../theme/spacing";

const { height } = Dimensions.get("window");

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isError) {
      Alert.alert(
        "Lỗi đăng nhập",
        message || "Tài khoản hoặc mật khẩu không chính xác",
      );
      dispatch(reset());
    }
    if (isSuccess || user) {
      dispatch(reset());
      navigation.replace("App");
    }
  }, [user, isError, isSuccess, message, dispatch, navigation]);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Định dạng email không hợp lệ");
      return;
    }
    dispatch(login({ email, password }));
  };

  const handleForgotPassword = () => {
    if (!isResettingPassword) {
      if (!email) {
        Alert.alert("Lỗi", "Vui lòng nhập email của bạn vào ô phía trên để đổi mật khẩu.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Lỗi", "Định dạng email không hợp lệ");
        return;
      }
      setIsResettingPassword(true);
    } else {
      setIsResettingPassword(false);
      setPassword('');
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
      return;
    }
    setResetLoading(true);
    try {
      await authService.resetPassword(email, password);
      Alert.alert("Thành công", "Mật khẩu của bạn đã được thay đổi. Vui lòng đăng nhập lại.");
      setIsResettingPassword(false);
      setPassword('');
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || error.message || "Không thể đặt lại mật khẩu");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Top Banner Image */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
        }}
        style={styles.headerImage}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>★ 4.9 Rated App</Text>
        </View>
      </ImageBackground>

      {/* Form Content */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isResettingPassword ? 'Khôi phục mật khẩu 🔐' : 'Chào mừng trở lại 👋'}</Text>
        <Text style={styles.subtitle}>{isResettingPassword ? 'Nhập mật khẩu mới cho tài khoản của bạn' : 'Đăng nhập vào tài khoản của bạn'}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="emma@gmail.com"
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
          <Text style={styles.inputLabel}>{isResettingPassword ? 'MẬT KHẨU MỚI' : 'MẬT KHẨU'}</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••••••"
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotText}>{isResettingPassword ? 'Hủy khôi phục' : 'Quên mật khẩu?'}</Text>
        </TouchableOpacity>

        {isError && (
          <Text style={styles.errorText}>
            {message || "Tài khoản hoặc mật khẩu không chính xác"}
          </Text>
        )}

        <Button
          title={isResettingPassword ? "Đổi mật khẩu" : "Đăng nhập"}
          onPress={isResettingPassword ? handleResetPassword : handleSignIn}
          loading={isResettingPassword ? resetLoading : isLoading}
          style={styles.signInButton}
        />

        {!isResettingPassword && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.link}>Đăng ký miễn phí</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FAF5F5", // Creamy pinkish white
  },
  headerImage: {
    height: height * 0.35,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
  badgeContainer: {
    backgroundColor: "#FFD166", // Honey yellow badge
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeText: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: "bold",
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
    fontWeight: "800",
    color: colors.dark,
    marginBottom: 6,
    fontFamily: "System",
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
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: "#FDF7F7", // Very soft peach background
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.dark,
    borderWidth: 0,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF7F7",
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
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 15,
    marginTop: -5,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: colors.grey,
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});

export default SignInScreen;

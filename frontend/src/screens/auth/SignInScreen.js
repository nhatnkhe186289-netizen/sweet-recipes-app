import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login, reset } from "../../store/authSlice";
import Button from "../../components/Button";
import colors from "../../theme/colors";
import styles from "../../css/SignInScreen.css";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("saved_email");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.error("Error loading saved email:", error);
      }
    };
    loadSavedEmail();
  }, []);

  useEffect(() => {
    if (isError) {
      Alert.alert(
        "Lỗi đăng nhập",
        message || "Tài khoản hoặc mật khẩu không chính xác",
      );
      dispatch(reset());
    }
    if (isSuccess || user) {
      if (email) {
        AsyncStorage.setItem("saved_email", email).catch((err) =>
          console.error(err),
        );
      }
      dispatch(reset());
      navigation.replace("App");
    }
  }, [user, isError, isSuccess, message, dispatch, navigation]);

  const handleSignIn = () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Top Banner Image */}
      <ImageBackground
        source={require("../../assets/images/login_cover.png")}
        style={styles.headerImage}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            Nơi chia sẻ các công thức làm bánh ngọt ngon nhất
          </Text>
        </View>
      </ImageBackground>

      {/* Form Content */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Chào mừng trở lại 👋</Text>
        <Text style={styles.subtitle}>
          Đăng nhập vào tài khoản công thức bánh ngọt của bạn
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.textInput}
            placeholderTextColor={colors.grey}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>MẬT KHẨU</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholderTextColor={colors.grey}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
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
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Button
          title="Đăng nhập"
          onPress={handleSignIn}
          loading={isLoading}
          style={styles.signInButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.link}>Đăng ký miễn phí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;

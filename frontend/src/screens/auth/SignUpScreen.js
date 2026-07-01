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
import { register, reset } from "../../store/authSlice";
import Button from "../../components/Button";
import colors from "../../theme/colors";
import styles from "../../css/SignUpScreen.css";

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isError) {
      Alert.alert(
        "Lỗi đăng ký",
        message || "Thông tin đăng ký không hợp lệ hoặc email đã tồn tại",
      );
      dispatch(reset());
    }
    if (isSuccess || user) {
      dispatch(reset());
      navigation.replace("App");
    }
  }, [user, isError, isSuccess, message, dispatch, navigation]);

  const handleSignUp = () => {
    if (!username || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ tất cả các trường thông tin");
      return;
    }
    dispatch(register({ username, email, password }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      {/* Top Banner Image */}
      <ImageBackground
        source={require("../../assets/images/login_cover.png")}
        style={styles.headerImage}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Tham gia cộng đồng yêu bánh ngọt</Text>
        </View>
      </ImageBackground>

      {/* Form Content */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Tạo tài khoản 👋</Text>
        <Text style={styles.subtitle}>
          Đăng ký để tham gia cộng đồng công thức bánh ngọt
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>TÊN ĐĂNG NHẬP</Text>
          <TextInput
            style={styles.textInput}
            placeholderTextColor={colors.grey}
            autoCapitalize="words"
            value={username}
            onChangeText={setUsername}
          />
        </View>

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

        <Button
          title="Đăng ký"
          onPress={handleSignUp}
          loading={isLoading}
          style={styles.signUpButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.link}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUpScreen;

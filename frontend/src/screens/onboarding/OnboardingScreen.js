import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import styles from '../../css/OnboardingScreen.css';

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const onboardingData = [
    {
      title: 'Khám phá công thức ngọt ngào',
      subtitle: 'Khám phá hơn 500 công thức món tráng miệng từ bánh ngọt đến kem, được tuyển chọn bởi các thợ làm bánh chuyên nghiệp.',
      image: require('../../assets/images/onboarding1.png'),
    },
    {
      title: 'Lưu trữ món ăn yêu thích',
      subtitle: 'Lưu giữ và sắp xếp các công thức bánh ngọt yêu thích của bạn để dễ dàng tra cứu mọi lúc mọi nơi.',
      image: require('../../assets/images/onboarding2.png'),
    },
    {
      title: 'Chia sẻ cùng cộng đồng',
      subtitle: 'Đăng tải các tác phẩm bánh ngọt tự làm của bạn và kết nối với cộng đồng những người đam mê làm bánh.',
      image: require('../../assets/images/onboarding3.png'),
    }
  ];

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  const current = onboardingData[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      {/* Curved Upper Background Image with Overlay */}
      <View style={styles.curveHeader}>
        <Image source={current.image} style={styles.headerImage} />
        <View style={styles.overlay} />
        
        {/* Floating Brand Logo Badge */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>🍰</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title={currentPage === onboardingData.length - 1 ? 'Bắt đầu ngay' : 'Tiếp theo'}
          onPress={handleNext}
          style={styles.button}
        />
        <TouchableOpacity onPress={() => navigation.replace('Auth')} style={styles.skipButton}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

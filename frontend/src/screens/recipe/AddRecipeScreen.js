import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import recipeService from '../../services/recipe.service';
import { fetchRecipes } from '../../store/recipeSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import spacing from '../../theme/spacing';
import alertService from '../../services/alertService';

const AddRecipeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(''); 
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState('Dễ');
  const [loading, setLoading] = useState(false);

  const { categories } = useSelector((state) => state.recipe);

  useEffect(() => {
    if (categories.length > 0) {
      setCategory(categories[0]._id);
    }
  }, [categories]);

  const handleAddRecipe = async () => {
    if (!title || !description || !ingredients || !instructions || !cookingTime || !calories || !category) {
      alertService.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các trường bắt buộc');
      return;
    }

    if (parseInt(cookingTime) <= 0 || parseInt(calories) <= 0) {
      alertService.alert('Lỗi', 'Thời gian nấu và lượng calo phải là số lớn hơn 0');
      return;
    }

    setLoading(true);

    try {
      // Split ingredients and instructions by line or comma
      const parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
      const parsedInstructions = instructions.split(',').map(i => i.trim()).filter(Boolean);

      // Create FormData to send image and other fields
      // For simple testing/mocking in React Native without standard document picker,
      // we will construct a mock multipart upload or normal object since we can handle both.
      // Let's send a standard body. In our controller, we check if image path is sent.
      // To bypass actual camera files in emulator/expo go, we can support JSON body if req.file is empty,
      // but let's check recipe.controller.js. It requires `req.file` or returns error 'Recipe image is required'.
      // Wait, let's create a formData structure. In a real React Native environment,
      // we use { uri: image, name: 'photo.jpg', type: 'image/jpeg' }. Let's construct it that way.
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('ingredients', JSON.stringify(parsedIngredients));
      formData.append('instructions', JSON.stringify(parsedInstructions));
      formData.append('cookingTime', cookingTime);
      formData.append('calories', calories);
      formData.append('difficulty', difficulty);

      if (image.startsWith('http')) {
        formData.append('image', image);
      } else {
        formData.append('image', {
          uri: image,
          name: 'recipe.jpg',
          type: 'image/jpeg',
        });
      }

      await recipeService.createRecipe(formData);
      alertService.alert('Thành công', 'Đăng công thức bánh mới thành công');
      dispatch(fetchRecipes());
      navigation.goBack();
    } catch (error) {
      alertService.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể đăng công thức bánh');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Thêm công thức</Text>
      
      <Input
        label="Tên công thức *"
        placeholder="VD: Bánh quy socola chip"
        value={title}
        onChangeText={setTitle}
      />
      <Input
        label="Mô tả *"
        placeholder="Mô tả món ăn của bạn"
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.label}>Ảnh món ăn *</Text>
      <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Chọn ảnh từ điện thoại</Text>
      </TouchableOpacity>
      {image ? (
        <Image source={{ uri: image }} style={styles.previewImage} />
      ) : null}
      
      <Text style={styles.label}>Danh mục *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {categories.map((cat) => (
          <Button
            key={cat._id}
            title={cat.name}
            variant={category === cat._id ? 'primary' : 'outline'}
            onPress={() => setCategory(cat._id)}
            style={styles.categoryBtn}
          />
        ))}
      </ScrollView>

      <Input
        label="Nguyên liệu (ngăn cách bằng dấu phẩy) *"
        placeholder="VD: Bột mì, Đường, Bơ"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <Input
        label="Hướng dẫn (ngăn cách bằng dấu phẩy) *"
        placeholder="VD: Trộn bột, Nướng ở 180 độ"
        value={instructions}
        onChangeText={setInstructions}
      />
      <Text style={styles.helperText}>VD: Trộn bột, Đổ vào khuôn, Nướng 20 phút (phân cách bằng dấu phẩy)</Text>
      <Input
        label="Thời gian nấu (phút) *"
        placeholder="VD: 45"
        keyboardType="numeric"
        value={cookingTime}
        onChangeText={setCookingTime}
      />
      <Input
        label="Calo *"
        placeholder="VD: 350"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      <Text style={styles.label}>Độ khó</Text>
      <View style={styles.difficultyRow}>
        {['Dễ', 'Trung bình', 'Khó'].map((level) => (
          <Button
            key={level}
            title={level}
            variant={difficulty === level ? 'primary' : 'outline'}
            onPress={() => setDifficulty(level)}
            style={styles.diffBtn}
          />
        ))}
      </View>

      <Button
        title="Đăng công thức"
        onPress={handleAddRecipe}
        loading={loading}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.white,
    flexGrow: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.dark,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.dark,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  categoryBtn: {
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  diffBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  imagePickerBtn: {
    backgroundColor: '#FFEBF0',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePickerText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: spacing.md,
  },
  helperText: {
    fontSize: 11,
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: spacing.md,
  }
});

export default AddRecipeScreen;

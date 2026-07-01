import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import recipeService from '../../services/recipe.service';
import { fetchRecipes } from '../../store/recipeSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from '../../css/EditRecipeScreen.css';

const EditRecipeScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { categories } = useSelector((state) => state.recipe);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const recipe = await recipeService.getRecipeById(recipeId);
        setTitle(recipe.title);
        setDescription(recipe.description);
        setImage(recipe.image || '');
        setCategory(recipe.category?._id || recipe.category);
        setIngredients(recipe.ingredients.join(', '));
        setInstructions(recipe.instructions.join(', '));
        setCookingTime(recipe.cookingTime.toString());
        setCalories(recipe.calories.toString());
        setDifficulty(recipe.difficulty);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin công thức bánh.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [recipeId]);

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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thiết bị.');
    }
  };

  const handleUpdateRecipe = async () => {
    if (!title || !description || !ingredients || !instructions || !cookingTime || !calories || !category || !image) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các trường bắt buộc và chọn hình ảnh');
      return;
    }

    setUpdating(true);

    try {
      const parsedIngredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
      const parsedInstructions = instructions.split(',').map(i => i.trim()).filter(Boolean);

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
      } else if (Platform.OS === 'web') {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('image', blob, 'recipe.jpg');
      } else {
        formData.append('image', {
          uri: image,
          name: 'recipe.jpg',
          type: 'image/jpeg',
        });
      }

      await recipeService.updateRecipe(recipeId, formData);
      Alert.alert('Thành công', 'Cập nhật công thức bánh thành công');
      dispatch(fetchRecipes());
      navigation.navigate('RecipeDetail', { recipeId });
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || error.message || 'Không thể cập nhật công thức bánh');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const isLocalImage = image && !image.startsWith('http');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chỉnh sửa công thức</Text>
      
      <Input
        label="Tên công thức *"
        placeholder="Ví dụ: Bánh Mousse Dâu Tây"
        value={title}
        onChangeText={setTitle}
      />
      <Input
        label="Mô tả *"
        placeholder="Viết một vài dòng mô tả về món bánh của bạn"
        multiline
        numberOfLines={3}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.imageSection}>
        <Text style={styles.label}>Hình ảnh công thức *</Text>
        <View style={styles.imagePickerRow}>
          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Text style={styles.pickImageBtnText}>Chọn ảnh từ thiết bị</Text>
          </TouchableOpacity>
          <Text style={styles.orText}>Hoặc</Text>
        </View>
        <Input
          placeholder="Nhập đường dẫn ảnh trực tuyến"
          value={isLocalImage ? 'Đã chọn ảnh từ thiết bị' : image}
          onChangeText={setImage}
          editable={!isLocalImage}
        />
        {isLocalImage && (
          <TouchableOpacity onPress={() => setImage('')} style={styles.clearImageBtn}>
            <Text style={styles.clearImageBtnText}>Xóa ảnh đã chọn</Text>
          </TouchableOpacity>
        )}
      </View>
      
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
        label="Nguyên liệu (phân tách bằng dấu phẩy) *"
        placeholder="Bột mì, Đường, Bơ, Trứng, Dâu tây"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <Input
        label="Các bước thực hiện (phân tách bằng dấu phẩy) *"
        placeholder="Trộn bột, Đánh kem, Nướng bánh ở 180 độ trong 20 phút"
        value={instructions}
        onChangeText={setInstructions}
      />
      <Input
        label="Thời gian thực hiện (phút) *"
        placeholder="Ví dụ: 45"
        keyboardType="numeric"
        value={cookingTime}
        onChangeText={setCookingTime}
      />
      <Input
        label="Lượng calo (kcal) *"
        placeholder="Ví dụ: 350"
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
        title="Lưu thay đổi"
        onPress={handleUpdateRecipe}
        loading={updating}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

export default EditRecipeScreen;

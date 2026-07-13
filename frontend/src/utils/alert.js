import { Alert, Platform } from 'react-native';

export const confirmAction = (title, message, onConfirm, onCancel) => {
  if (Platform.OS === 'web') {
    // Window.confirm blocks thread and returns boolean
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: 'Hủy', style: 'cancel', onPress: onCancel },
        { text: 'Đồng ý', style: 'destructive', onPress: onConfirm },
      ]
    );
  }
};

export const showToast = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

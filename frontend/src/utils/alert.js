import { Platform } from 'react-native';
import alertService from '../services/alertService';

export const confirmAction = (title, message, onConfirm, onCancel) => {
  alertService.confirm(title, message, onConfirm, onCancel);
};

export const showToast = (title, message) => {
  alertService.alert(title, message);
};

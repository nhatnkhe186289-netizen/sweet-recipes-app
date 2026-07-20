class AlertService {
  constructor() {
    this.alertRef = null;
  }

  setRef(ref) {
    this.alertRef = ref;
  }

  alert(title, message, onConfirm = null) {
    if (this.alertRef) {
      this.alertRef.show({ title, message, type: 'alert', onConfirm });
    } else {
      console.warn('AlertService not initialized');
    }
  }

  confirm(title, message, onConfirm = null, onCancel = null, confirmText = 'Đồng ý', cancelText = 'Hủy') {
    if (this.alertRef) {
      this.alertRef.show({ title, message, type: 'confirm', onConfirm, onCancel, confirmText, cancelText });
    } else {
      console.warn('AlertService not initialized');
    }
  }
}

export default new AlertService();

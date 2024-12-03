export const showConfirm = (options) => {
    confirmDialog({
        message: options.message || 'Та энэ үйлдлийг хийхдээ итгэлтэй байна уу?',
        header: options.header || 'Баталгаажуулах',
        icon: 'pi pi-exclamation-triangle',
        acceptClassName: 'p-button-danger',
        acceptLabel: options.acceptLabel || 'Тийм',
        rejectLabel: options.rejectLabel || 'Үгүй',
        accept: options.accept,
        reject: options.reject || (() => {})
    });
};

export const showToast = (toast, type, message) => {
    toast.current.show({
        severity: type,
        summary: type === 'success' ? 'Амжилттай' : 'Алдаа',
        detail: message,
        life: 3000
    });
}; 
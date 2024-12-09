import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

export const showConfirm = (options) => {
    confirmDialog({
        message: options.message || 'Та энэ үйлдлийг хийхдээ итгэлтэй байна уу?',
        header: options.header || 'Баталгаажуулах',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Тийм',
        rejectLabel: 'Үгүй',
        accept: options.accept,
        reject: options.reject
    });
};

export const showToast = (toastRef, severity, summary, detail) => {
    toastRef.current?.show({
        severity: severity,
        summary: summary,
        detail: detail,
        life: 3000
    });
}; 
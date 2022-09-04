import React from 'react';
import toast from 'react-hot-toast';
import { Toast } from 'react-bootstrap';

export enum ToastType {
  Success = 'success',
  Warning = 'warning',
  Error = 'danger',
}

const createToast = (message: string, type: ToastType) => {
  toast.custom(
    (t) => (
      <Toast
        bg={type}
        // onClose={() => {
        //   toast.remove(t.id);
        // }}
      >
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    ),
    { position: 'top-right', duration: 2000 }
  );
};

export default createToast;

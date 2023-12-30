import { ref } from 'vue';

export const snackbar = ref({
  show: false,
  message: '',
  color: '',
});

export enum SnackbarStatus {
  Success = 'success',
  Error = 'error',
  Executing = 'primary',
}

export const snackbarShow = (message: string, status: SnackbarStatus = SnackbarStatus.Success) => {
  snackbar.value.show = true;
  snackbar.value.message = message;
  snackbar.value.color = status;
};

import { toast } from 'react-toastify';
export const useToast = () => ({
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast.info(msg),
  warning: (msg) => toast.warning(msg),
});

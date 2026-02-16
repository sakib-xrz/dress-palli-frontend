import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      closeButton: false,
      duration: 3000,
      style: {
        backgroundColor: "#16a34a",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        backgroundColor: "#ef4444",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
      },
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 4000,
      style: {
        backgroundColor: "#3b82f6",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
      },
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      duration: 4000,
      style: {
        backgroundColor: "#f59e0b",
        color: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
      },
    });
  },
};

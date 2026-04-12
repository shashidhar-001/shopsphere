import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// Usage:
// const { guard, AuthModalComponent } = useAuthGuard()
// guard(() => addToCart(product))   ← if not logged in, shows modal

export function useAuthGuard() {
  const { user }                  = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg]   = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  // Call this before any protected action
  const guard = (action, message = "Please sign in to continue.") => {
    if (user) {
      // User is logged in — run the action directly
      action();
    } else {
      // Not logged in — show modal
      setModalMsg(message);
      setPendingAction(() => action);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingAction(null);
  };

  return {
    guard,
    showModal,
    modalMsg,
    closeModal,
  };
}
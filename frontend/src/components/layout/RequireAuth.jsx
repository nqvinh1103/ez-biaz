import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginModal } from "../../context/LoginModalContext";
import { useAuth } from "../../hooks/useAuth";

/**
 * Wraps protected routes. If user is not logged in:
 * - Redirects to home
 * - Opens the login modal automatically
 */
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/", { replace: true });
      openLoginModal();
    }
  }, [isLoggedIn, navigate, openLoginModal]);

  if (!isLoggedIn) return null;

  return children;
}

export default RequireAuth;

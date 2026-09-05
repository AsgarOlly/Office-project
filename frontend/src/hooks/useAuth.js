import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const { currentUser, setCurrentUser, logout } = useApp();

  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    role: currentUser?.role,
    roleKey: currentUser?.roleKey || currentUser?.role_key || 'admin',
    permissions: currentUser?.permissions || [],
    logout,
  };
};

export default useAuth;

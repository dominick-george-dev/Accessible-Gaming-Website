// Export a hook to allow pages to update login state
export function useAuth() {
  // Store the intended redirect path before navigating to login/signup
  const saveRedirectPath = (path: string) => {
    localStorage.setItem('redirectPath', path);
  };

  // Get the stored redirect path and clear it
  const getAndClearRedirectPath = (): string => {
    const redirectPath = localStorage.getItem('redirectPath') || '/';
    localStorage.removeItem('redirectPath');
    return redirectPath;
  };

  const setLoginState = (loggedIn: boolean, userData?: { username: string; email: string; isAdmin: boolean; isPublisher: boolean }) => {
    localStorage.setItem('isLoggedIn', loggedIn.toString());
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    
    // If user just logged in, redirect to the intended page
    if (loggedIn) {
      const redirectPath = getAndClearRedirectPath();
      window.location.href = redirectPath;
    } else {
      // Trigger a page refresh to update the navigation
      window.location.reload();
    }
  };

  return { setLoginState, saveRedirectPath, getAndClearRedirectPath };
}

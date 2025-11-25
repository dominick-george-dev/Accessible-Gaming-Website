import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSymbol: boolean;
}

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password validation
  const validatePassword = (pwd: string): PasswordValidation => {
    return {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(pwd),
    };
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Client-side validation
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Username is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Username must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet security requirements';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      const errorMessage = Object.values(newErrors).join('. ');
      announceToScreenReader(errorMessage);
      return;    }

    try {
      // Call backend API directly
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        toast.success('Account created successfully! You are now logged in.');
        
        // Redirect to previous page if available, otherwise go to home
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        
        // Use setTimeout to allow the toast to show before navigation
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
      }else {
        // Handle API errors
        if (data.message && data.message.includes('email already exists')) {
          setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' });
        } else if (data.message && data.message.includes('username') && data.message.includes('taken')) {
          setErrors({ name: 'This username is already taken. Please choose a different username.' });
        } else if (data.message) {
          // Handle validation errors from backend
          const errorMsg = Array.isArray(data.message) ? data.message.join('. ') : data.message;
          if (errorMsg.includes('Password must contain')) {
            setErrors({ password: errorMsg });
          } else if (errorMsg.includes('Username must be')) {
            setErrors({ name: errorMsg });
          } else if (errorMsg.includes('email')) {
            setErrors({ email: errorMsg });
          } else {
            toast.error(errorMsg);
          }
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle signup errors
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      
      if (errorMessage.includes('email already exists')) {
        setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' });
      } else if (errorMessage.includes('username') && errorMessage.includes('taken')) {
        setErrors({ name: 'This username is already taken. Please choose a different username.' });
      } else if (errorMessage.includes('Password must contain')) {
        setErrors({ password: errorMessage });
      } else if (errorMessage.includes('Username must be')) {
        setErrors({ name: errorMessage });
      } else if (errorMessage.includes('email')) {
        setErrors({ email: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const announceToScreenReader = (message: string) => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'alert');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };
  // Handle navigation to login while preserving redirect path
  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className="flex items-center gap-2" role="listitem">
      {isValid ? (
        <Check className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>
        {text}
      </span>
    </div>
  );
  
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up to personalize your experience and save your favorite accessible games
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Username Field - Updated label */}
            <div className="space-y-2">
              <Label htmlFor="signup-name">
                Username
                <span className="text-destructive ml-1" aria-label="required">*</span>
              </Label>
              <Input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="johndoe"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                autoComplete="username"
                disabled={isSubmitting}
              />
              {errors.name && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id="name-error" role="alert">
                    {errors.name}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Email Field - Keep existing */}
            <div className="space-y-2">
              <Label htmlFor="signup-email">
                Email address
                <span className="text-destructive ml-1" aria-label="required">*</span>
              </Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription id="email-error" role="alert">
                    {errors.email}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Password Field with validation - Keep existing */}
            <div className="space-y-2">
              <Label htmlFor="signup-password">
                Password
                <span className="text-destructive ml-1" aria-label="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-requirements"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>

              {/* Password Requirements */}
              <div 
                id="password-requirements" 
                className="bg-muted/50 p-3 rounded-md space-y-2"
                role="list"
                aria-label="Password requirements"
              >
                <p className="text-xs text-muted-foreground mb-2">Password must contain:</p>
                <div className="space-y-1 text-xs">
                  <ValidationItem 
                    isValid={passwordValidation.minLength} 
                    text="At least 8 characters" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasUpperCase} 
                    text="At least one uppercase letter (A-Z)" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasLowerCase} 
                    text="At least one lowercase letter (a-z)" 
                  />
                  <ValidationItem 
                    isValid={passwordValidation.hasSymbol} 
                    text="At least one symbol (!@#$%^&*...)" 
                  />
                </div>
              </div>

              {errors.password && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription role="alert">
                    {errors.password}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Confirm Password Field - Keep existing */}
            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">
                Confirm password
                <span className="text-destructive ml-1" aria-label="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  aria-invalid={!!errors.confirmPassword}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" aria-hidden="true" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription role="alert">
                    {errors.confirmPassword}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-5">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
            
            <div className="text-center">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button
                type="button"
                variant="link"
                onClick={handleNavigateToLogin}
                className="px-1"
              >
                Sign in
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
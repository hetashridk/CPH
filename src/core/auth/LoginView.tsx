
import React, { useState, useRef } from 'react';
import { 
    signInWithGoogle, 
    auth, 
    resetPassword, 
    setPersistencePreference,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile 
} from './firebase';

export const LoginView: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const cardRef = useRef<HTMLDivElement>(null);

    const handleEmailAuth = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isSignUp) {
                if (!fullName.trim()) throw new Error("Please enter your full name.");
                await setPersistencePreference(rememberMe);
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: fullName });
            } else {
                await setPersistencePreference(rememberMe);
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            let msg = err.message;
            if (msg.includes('Firebase:')) {
                msg = msg.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim();
            }
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            await resetPassword(email);
            setSuccessMessage("Password reset email sent! Check your inbox.");
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError('');
        try {
            await setPersistencePreference(true);
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const toggleView = (e: React.MouseEvent, view: 'login' | 'signup' | 'reset') => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (view === 'reset') {
            setIsResettingPassword(true);
        } else {
            setIsResettingPassword(false);
            setIsSignUp(view === 'signup');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleEmailAuth(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height } = currentTarget.getBoundingClientRect();
        
        // 1. Global Mouse Position (Pixels) for Background
        currentTarget.style.setProperty('--mouse-x', `${clientX}px`);
        currentTarget.style.setProperty('--mouse-y', `${clientY}px`);

        // 2. Normalized Position (-1 to 1) for Parallax
        const dx = (clientX / width - 0.5) * 2;
        const dy = (clientY / height - 0.5) * 2;

        currentTarget.style.setProperty('--dx', `${dx}`);
        currentTarget.style.setProperty('--dy', `${dy}`);

        // 3. Relative Position for Card Spotlight
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            cardRef.current.style.setProperty('--card-mouse-x', `${x}px`);
            cardRef.current.style.setProperty('--card-mouse-y', `${y}px`);
        }
    };

    return (
        <div className="auth-container" onMouseMove={handleMouseMove}>
            {/* Liquid Background Elements */}
            <div className="liquid-background">
                <div className="liquid-orb orb-1"></div>
                <div className="liquid-orb orb-2"></div>
                <div className="liquid-orb orb-3"></div>
                <div className="liquid-orb orb-4"></div>
                {/* Central gradient blob behind card */}
                <div className="liquid-orb orb-center"></div>
                <div className="liquid-orb orb-mouse"></div>
            </div>

            <div className="auth-card" ref={cardRef}>
                
                {/* --- HEADER --- */}
                <div className="auth-header">
                    <h1>{isSignUp ? 'Create Account' : isResettingPassword ? 'Reset Password' : 'AI Marketing Studio'}</h1>
                    <p>{isResettingPassword ? 'Enter email to reset.' : isSignUp ? 'Join the creative revolution.' : 'Sign in to access your workspace.'}</p>
                </div>

                {/* --- FORM --- */}
                {isResettingPassword ? (
                    <form onSubmit={handlePasswordReset} className="auth-form">
                        <input 
                            className="auth-input"
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        {error && <div className="auth-error-msg">{error}</div>}
                        {successMessage && <div className="auth-success-msg">{successMessage}</div>}
                        <button type="submit" className="button auth-submit-btn" disabled={isLoading}>
                            {isLoading ? <span className="spinner auth-spinner" /> : 'Send Reset Link'}
                        </button>
                        <button className="forgot-password-link center-link" type="button" onClick={(e) => toggleView(e, 'login')}>
                            Back to Sign In
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleEmailAuth} className="auth-form">
                        {isSignUp && (
                            <input 
                                className="auth-input"
                                type="text" 
                                placeholder="Full Name" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)} 
                                required 
                            />
                        )}
                        <input 
                            className="auth-input"
                            type="email" 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        
                        <div className="password-input-wrapper">
                            <input 
                                className="auth-input password-field"
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                required 
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        
                        {!isSignUp && (
                            <div className="auth-options">
                                <label className="custom-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        className="custom-checkbox-input"
                                        checked={rememberMe} 
                                        onChange={e => setRememberMe(e.target.checked)}
                                    />
                                    <div className="custom-checkbox-box">
                                        {rememberMe && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    Remember me
                                </label>
                                <button type="button" onClick={(e) => toggleView(e, 'reset')} className="forgot-password-link">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {error && <div className="auth-error-msg">{error}</div>}
                        
                        <button type="submit" className="button auth-submit-btn" disabled={isLoading}>
                            {isLoading ? <span className="spinner auth-spinner" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>
                )}

                {!isResettingPassword && (
                    <>
                        <div className="auth-divider">
                            <hr /><span>OR</span><hr />
                        </div>

                        <button type="button" className="button button-full-width google-auth-btn" onClick={handleGoogleAuth}>
                            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" style={{marginRight: '12px'}}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                        </button>

                        <p className="auth-footer-text">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <button type="button" onClick={(e) => toggleView(e, isSignUp ? 'login' : 'signup')} className="auth-footer-link">
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

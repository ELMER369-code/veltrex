
import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../constants';
import { ArrowRight, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, RefreshCw, Undo2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onAuthenticated: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  // Determine initial mode based on local storage
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('SIGNUP');
  
  // Signup State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1); // 1: Name, 2: Create PIN, 3: Confirm PIN
  
  // Recovery State
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Secret Code, 2: New PIN, 3: Confirm New PIN
  const [secretInput, setSecretInput] = useState('');
  
  // Shared State
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [storedUser, setStoredUser] = useState<UserProfile | null>(null);

  // Input Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const secretInputRef = useRef<HTMLInputElement>(null);

  const MASTER_SECRET = "ELMER THE GREAT";

  useEffect(() => {
    const savedData = localStorage.getItem('veltrex_user_profile');
    if (savedData) {
      setStoredUser(JSON.parse(savedData));
      setMode('LOGIN');
    } else {
      setMode('SIGNUP');
    }
  }, []);

  // Auto-focus logic
  useEffect(() => {
    if (mode === 'SIGNUP' && signupStep === 1) {
        nameInputRef.current?.focus();
    } else if (mode === 'LOGIN' || (mode === 'SIGNUP' && signupStep > 1) || (mode === 'RECOVERY' && recoveryStep > 1)) {
        pinInputRef.current?.focus();
    } else if (mode === 'RECOVERY' && recoveryStep === 1) {
        secretInputRef.current?.focus();
    }
  }, [mode, signupStep, recoveryStep]);

  const handleSignupNext = () => {
    if (signupStep === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      setError('');
      setSignupStep(2);
      setPin('');
    } else if (signupStep === 2) {
      if (pin.length < 4) {
        setError('PIN must be 4 digits.');
        return;
      }
      setError('');
      setSignupStep(3);
    } else if (signupStep === 3) {
      if (confirmPin !== pin) {
        setError('PINs do not match. Try again.');
        setConfirmPin('');
        setPin(''); // Reset both for security
        setSignupStep(2);
        return;
      }

      // Success: Create Account
      const newUser: UserProfile = {
        firstName,
        lastName,
        pin,
        hasAccount: true
      };
      localStorage.setItem('veltrex_user_profile', JSON.stringify(newUser));
      onAuthenticated(newUser);
    }
  };

  const handleLogin = () => {
    if (!storedUser) return;
    
    if (pin === storedUser.pin) {
      onAuthenticated(storedUser);
    } else {
      setError('Incorrect Access Code.');
      setPin('');
    }
  };

  // --- RECOVERY LOGIC ---

  const initRecovery = () => {
      setMode('RECOVERY');
      setRecoveryStep(1);
      setSecretInput('');
      setPin('');
      setConfirmPin('');
      setError('');
  };

  const cancelRecovery = () => {
      setMode('LOGIN');
      setPin('');
      setError('');
  };

  const handleRecoveryNext = () => {
      if (recoveryStep === 1) {
          // Verify Secret
          if (secretInput !== MASTER_SECRET) {
              setError('Invalid Secret Code.');
              setSecretInput('');
              return;
          }
          // Success
          setError('');
          setRecoveryStep(2);
          setPin('');
      } else if (recoveryStep === 2) {
          // Set New PIN
          if (pin.length < 4) {
              setError('PIN must be 4 digits.');
              return;
          }
          setError('');
          setRecoveryStep(3);
      } else if (recoveryStep === 3) {
          // Confirm New PIN
          if (confirmPin !== pin) {
              setError('PINs do not match.');
              setConfirmPin('');
              setPin('');
              setRecoveryStep(2);
              return;
          }
          
          // FINAL SUCCESS: Overwrite User PIN
          if (storedUser) {
              const updatedUser = { ...storedUser, pin: pin };
              localStorage.setItem('veltrex_user_profile', JSON.stringify(updatedUser));
              setStoredUser(updatedUser); // Update local state
              onAuthenticated(updatedUser); // Log them in
          }
      }
  };

  // PIN Input Handler
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, isConfirm = false) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (isConfirm) setConfirmPin(val);
    else setPin(val);
    setError('');
  };

  // Render 4-digit PIN circles
  const renderPinDisplay = (value: string) => (
    <div className="flex justify-center gap-4 mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div 
          key={i}
          className={`
            w-4 h-4 rounded-full border transition-all duration-300
            ${value.length > i 
              ? 'bg-neon-cyan border-neon-cyan shadow-[0_0_10px_#00F0FF]' 
              : 'bg-transparent border-white/20'}
          `}
        />
      ))}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#05050F] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="z-10 w-full max-w-md p-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12">
           <Logo className="w-20 h-20 mb-6 animate-pulse" />
           <h1 className="text-4xl font-heading font-bold tracking-[0.2em] text-white mb-2 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
             VELTREX
           </h1>
           <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-neon-cyan to-transparent mb-2" />
           <span className="text-xs text-neon-cyan font-mono tracking-widest uppercase opacity-80">
             Future Trading Terminal
           </span>
        </div>

        {/* Content Box */}
        <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Gloss Effect */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* --- SIGNUP MODE --- */}
            {mode === 'SIGNUP' && (
                <>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="text-neon-cyan" size={20} />
                        {signupStep === 1 ? 'Identity Setup' : 'Security Setup'}
                    </h2>
                    
                    {signupStep === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold ml-1">First Name</label>
                                <input 
                                    ref={nameInputRef}
                                    type="text" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 focus:border-neon-cyan text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold ml-1">Last Name</label>
                                <input 
                                    type="text" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 focus:border-neon-cyan text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Enter last name"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSignupNext()}
                                />
                            </div>
                        </div>
                    )}

                    {signupStep === 2 && (
                        <div className="text-center relative">
                            <p className="text-gray-400 text-sm mb-6">Create a 4-digit access PIN</p>
                            {renderPinDisplay(pin)}
                            <input 
                                ref={pinInputRef}
                                type="tel" 
                                maxLength={4}
                                value={pin}
                                onChange={(e) => handlePinChange(e)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSignupNext()}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                autoFocus
                            />
                        </div>
                    )}

                    {signupStep === 3 && (
                        <div className="text-center relative">
                            <p className="text-gray-400 text-sm mb-6">Confirm your access PIN</p>
                            {renderPinDisplay(confirmPin)}
                            <input 
                                ref={pinInputRef}
                                type="tel" 
                                maxLength={4}
                                value={confirmPin}
                                onChange={(e) => handlePinChange(e, true)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSignupNext()}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-neon-magenta text-xs font-bold animate-pulse">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleSignupNext}
                        className="mt-8 w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neon-cyan transition-colors relative z-20"
                    >
                        {signupStep === 3 ? 'Create Account' : 'Next Step'} <ArrowRight size={18} />
                    </button>
                </>
            )}

            {/* --- LOGIN MODE --- */}
            {mode === 'LOGIN' && storedUser && (
                <div className="text-center relative">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Welcome back, {storedUser.firstName}</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Enter Access Code</p>
                    </div>

                    <div className="relative py-4">
                        {renderPinDisplay(pin)}
                        <input 
                            ref={pinInputRef}
                            type="password" 
                            inputMode="numeric"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => handlePinChange(e)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-default z-10"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="mb-4 flex items-center justify-center gap-2 text-neon-magenta text-xs font-bold animate-pulse">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    
                    <button 
                        onClick={handleLogin}
                        className="w-full bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-neon-cyan hover:text-black transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] relative z-20 mb-4"
                    >
                        <ShieldCheck size={18} /> Unlock Terminal
                    </button>

                    <button 
                        onClick={initRecovery}
                        className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 hover:decoration-white transition-all"
                    >
                        Forgot PIN Code?
                    </button>
                </div>
            )}

            {/* --- RECOVERY MODE --- */}
            {mode === 'RECOVERY' && (
                <div className="text-center relative animate-in slide-in-from-right duration-300">
                    <button 
                        onClick={cancelRecovery} 
                        className="absolute -top-2 -left-2 p-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <Undo2 size={18} />
                    </button>

                    <div className="mb-6">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3 text-red-500 border border-red-500/30">
                            <KeyRound size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Account Recovery</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                            {recoveryStep === 1 && "Security Check"}
                            {recoveryStep === 2 && "Create New PIN"}
                            {recoveryStep === 3 && "Confirm New PIN"}
                        </p>
                    </div>

                    {recoveryStep === 1 && (
                        <div className="space-y-4">
                             <div className="relative">
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-2 text-left">Secret Password</label>
                                <input 
                                    ref={secretInputRef}
                                    type="text" 
                                    value={secretInput}
                                    onChange={(e) => setSecretInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRecoveryNext()}
                                    className="w-full bg-black/40 border border-red-500/30 focus:border-red-500 text-white px-4 py-3 rounded-xl outline-none transition-all placeholder:text-gray-700 text-center font-mono tracking-wider"
                                    placeholder="ENTER SECRET CODE"
                                    autoComplete="off"
                                />
                             </div>
                        </div>
                    )}

                    {(recoveryStep === 2 || recoveryStep === 3) && (
                        <div className="relative py-4">
                             {renderPinDisplay(recoveryStep === 2 ? pin : confirmPin)}
                             <input 
                                ref={pinInputRef}
                                type="tel" 
                                maxLength={4}
                                value={recoveryStep === 2 ? pin : confirmPin}
                                onChange={(e) => handlePinChange(e, recoveryStep === 3)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRecoveryNext()}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleRecoveryNext}
                        className="mt-6 w-full bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                         {recoveryStep === 1 ? 'Verify Secret' : recoveryStep === 3 ? 'Reset PIN' : 'Next Step'}
                         <RefreshCw size={16} />
                    </button>
                </div>
            )}

        </div>
        
        <div className="mt-8 flex flex-col items-center gap-1">
            <div className="text-[10px] text-gray-600 font-mono">
                SECURE CONNECTION // ENCRYPTED
            </div>
            <div className="text-[9px] text-gray-700 font-bold tracking-wider uppercase mt-2">
                Created by Elmerio S. Talara
            </div>
             <div className="text-[8px] text-gray-800 tracking-widest uppercase">
                Bohol Island State University Main Campus
            </div>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;

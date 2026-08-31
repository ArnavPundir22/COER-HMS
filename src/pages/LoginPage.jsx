import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, isLockedOut, lockoutTimer } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute Password Strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#CBD5E1' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 50, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 75, label: 'Good', color: '#3B82F6' };
    return { score: 100, label: 'Strong & Secure', color: '#10B981' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      setIsLoading(false);
      if (!res || !res.success) {
        setErrorMsg(res?.error || '⚠️ Invalid username or password.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('⚠️ Invalid username or password.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        {/* Institutional Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.625rem 1.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            border: '1px solid #CBD5E1',
            marginBottom: '0.875rem'
          }}>
            <img 
              src="/coer-logo.png" 
              alt="COER University Seal" 
              style={{ height: '56px', objectFit: 'contain' }} 
            />
          </div>

          <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F766E', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            COER MEDICAL COLLEGE OF AYURVEDA AND HOSPITAL
          </h1>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginTop: '0.25rem' }}>
            Hospital Management System • Secure Staff Portal
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem' }}>
            Recognized by NCISM & Ministry of AYUSH, Govt. of India
          </div>
        </div>

        {/* Security Lockout Banner Alert */}
        {isLockedOut && (
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '2px solid #FCA5A5',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991B1B',
            animation: 'pulse 1.5s infinite'
          }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Security Lockout Engaged</div>
              <div style={{ fontSize: '0.78125rem' }}>
                Too many failed attempts. Please wait <strong>{lockoutTimer}s</strong> before retrying.
              </div>
            </div>
          </div>
        )}

        {/* General Error Message for Invalid Credentials */}
        {errorMsg && !isLockedOut && (
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '2px solid #FCA5A5',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            color: '#B91C1C',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
          }}>
            <AlertTriangle size={20} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={15} color="#0F766E" /> Username / Staff ID
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="Enter Staff Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLockedOut || isLoading}
                style={{
                  paddingLeft: '2.5rem',
                  height: '44px',
                  fontSize: '0.9375rem',
                  fontWeight: 600
                }}
              />
              <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '0.875rem', top: '13px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lock size={15} color="#0F766E" /> Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                required 
                placeholder="Enter Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLockedOut || isLoading}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: '2.5rem',
                  height: '44px',
                  fontSize: '0.9375rem',
                  fontWeight: 600
                }}
              />
              <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '0.875rem', top: '13px' }} />
              
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Entropy Strength Meter */}
            {password && (
              <div style={{ marginTop: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', fontWeight: 700, marginBottom: '0.15rem' }}>
                  <span>Password Security Strength:</span>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${strength.score}%`, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLockedOut || isLoading}
            style={{
              height: '46px',
              fontSize: '1rem',
              fontWeight: 800,
              marginTop: '0.5rem',
              backgroundColor: '#0F766E',
              boxShadow: '0 6px 20px rgba(15, 118, 110, 0.3)'
            }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Login to HMS <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} color="#10B981" /> 256-bit Encrypted Session • Restricted Authorized Personnel Access
        </div>
      </div>
    </div>
  );
};

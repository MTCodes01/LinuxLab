import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Terminal, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import anime from 'animejs';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Floating particles
  useEffect(() => {
    if (!particlesRef.current) return;
    const particles = particlesRef.current.querySelectorAll('.particle');
    particles.forEach((particle, i) => {
      anime({
        targets: particle,
        translateX: () => anime.random(-150, 150),
        translateY: () => anime.random(-150, 150),
        scale: [0.4, anime.random(0.7, 1.4)],
        opacity: [0, anime.random(0.15, 0.4)],
        duration: anime.random(4000, 8000),
        delay: i * 150,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    });
  }, []);

  // Card entrance
  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        easing: 'easeOutExpo',
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
      anime({
        targets: cardRef.current,
        translateX: [0, -12, 12, -8, 8, 0],
        duration: 500,
        easing: 'easeInOutSine',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              width:  `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              background: i % 3 === 0
                ? 'var(--color-primary)'
                : i % 3 === 1
                  ? 'var(--color-accent)'
                  : 'rgba(139, 92, 246, 0.5)',
              left:  `${Math.random() * 100}%`,
              top:   `${Math.random() * 100}%`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-sm mx-4" style={{ opacity: 0 }}>
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 60px rgba(139,92,246,0.12), 0 24px 60px rgba(0,0,0,0.7)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-5 shadow-glow">
              <Terminal className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">LinuxLab</h1>
            <p className="text-sm text-text-muted mt-1.5">
              Sign in to your self-hosted platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl text-sm bg-danger/10 border border-danger/20 text-danger animate-slide-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-base"
                placeholder="admin"
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-base pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-default"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-text-muted mt-6 leading-relaxed">
            LinuxLab · Self-hosted Linux environments
          </p>
        </div>
      </div>
    </div>
  );
}

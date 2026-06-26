import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Terminal, Lock, AlertCircle } from 'lucide-react';
import anime from 'animejs';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Floating particles animation
  useEffect(() => {
    if (!particlesRef.current) return;
    const particles = particlesRef.current.querySelectorAll('.particle');
    particles.forEach((particle, i) => {
      anime({
        targets: particle,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: [0.5, anime.random(0.8, 1.5)],
        opacity: [0.1, anime.random(0.2, 0.5)],
        duration: anime.random(3000, 6000),
        delay: i * 200,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine',
      });
    });
  }, []);

  // Card entrance animation
  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
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
      setError(err.response?.data?.detail || 'Login failed');
      // Shake animation on error
      anime({
        targets: cardRef.current,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 400,
        easing: 'easeInOutSine',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-mesh" style={{ background: 'var(--color-surface-900)' }}>
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-accent)' : 'rgba(139, 92, 246, 0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div ref={cardRef} className="relative z-10 w-full max-w-md mx-4" style={{ opacity: 0 }}>
        <div className="glass glow-primary p-8 rounded-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-light bg-clip-text text-transparent">
              LinuxLab
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              Self-hosted Linux environments
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl text-sm"
                 style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger-light)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-default focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
                placeholder="admin"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-default focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ background: 'var(--color-surface-700)', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)' }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-primary
                         hover:brightness-110 transition-default disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

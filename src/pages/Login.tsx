import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';
import '../login-spec.css';

const DECO_SPECS = [
  { size: 8, color: '#1ab8cc', left: '15%', duration: 18, delay: 0 },
  { size: 5, color: '#22c98a', left: '28%', duration: 22, delay: 4 },
  { size: 10, color: '#1ab8cc', left: '55%', duration: 16, delay: 8 },
  { size: 6, color: '#3b91f5', left: '72%', duration: 20, delay: 2 },
  { size: 7, color: '#1ab8cc', left: '88%', duration: 25, delay: 6 },
  { size: 4, color: '#8b74f5', left: '42%', duration: 19, delay: 12 },
  { size: 9, color: '#22c98a', left: '6%', duration: 23, delay: 9 },
  { size: 5, color: '#1ab8cc', left: '95%', duration: 17, delay: 3 },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [passErr, setPassErr] = useState(false);
  const [apiError, setApiError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let particles: Array<{
      x: number; y: number; r: number; vx: number; vy: number;
      alpha: number; pulse: number; speed: number; type: string;
    }> = [];
    let pulses: Array<{ x: number; y: number; r: number; alpha: number }> = [];
    let ambientT = 0;
    let scanY = -100;
    let pulseTimer = 0;
    let rafId: number;

    const bgColour = () => (isDark ? '#0d1520' : '#e8eef5');
    const gridColour = () => (isDark ? 'rgba(26,184,204,0.04)' : 'rgba(26,184,204,0.07)');
    const glowColour = () => (isDark ? 'rgba(26,184,204,0.15)' : 'rgba(15,138,154,0.12)');
    const nodeColour = (alpha: number) => (isDark ? `rgba(26,184,204,${alpha})` : `rgba(26,184,204,${alpha * 0.9})`);
    const lineColour = (opacity: number) => `rgba(26,184,204,${opacity})`;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      createParticles();
    }

    function createParticles() {
      const N = Math.floor((W * H) / 22000);
      particles = [];
      for (let i = 0; i < N; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          alpha: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.005,
          type: Math.random() > 0.85 ? 'bright' : 'dim',
        });
      }
    }

    function drawGrid() {
      ctx.strokeStyle = gridColour();
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < W; x += 60) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y < H; y += 60) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    }

    const glows = [
      { bx: 0.2, by: 0.3, r: 350, phase: 0 },
      { bx: 0.8, by: 0.7, r: 300, phase: Math.PI },
      { bx: 0.5, by: 0.1, r: 250, phase: Math.PI / 2 },
    ];

    function drawAmbient() {
      ambientT += 0.003;
      glows.forEach((g) => {
        const x = g.bx * W + Math.sin(ambientT + g.phase) * 40;
        const y = g.by * H + Math.cos(ambientT + g.phase * 0.7) * 30;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, g.r);
        grad.addColorStop(0, glowColour());
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(x - g.r, y - g.r, g.r * 2, g.r * 2);
      });
    }

    function drawScan() {
      scanY += 0.4;
      if (scanY > H + 100) scanY = -100;
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, isDark ? 'rgba(26,184,204,0.03)' : 'rgba(26,184,204,0.025)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, W, 120);
    }

    function drawLines() {
      const maxDist = 120;
      const maxOpacity = isDark ? 0.12 : 0.10;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * maxOpacity;
            ctx.strokeStyle = lineColour(opacity);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function drawPulses() {
      pulseTimer++;
      if (pulseTimer >= 90 && particles.length > 0) {
        pulseTimer = 0;
        const p = particles[Math.floor(Math.random() * particles.length)];
        pulses.push({ x: p.x, y: p.y, r: 0, alpha: 0.5 });
      }
      pulses = pulses.filter((p) => {
        p.r += 1.2;
        p.alpha -= 0.008;
        if (p.alpha < 0.01) return false;
        ctx.strokeStyle = lineColour(p.alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        return true;
      });
    }

    function drawParticles() {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        p.pulse += p.speed;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        if (p.type === 'bright') {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
          g.addColorStop(0, lineColour(a * 0.5));
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = nodeColour(a);
        if (p.type === 'dim') ctx.globalAlpha = 0.65 + 0.2 * Math.sin(p.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    function frame() {
      ctx.fillStyle = bgColour();
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      drawAmbient();
      drawScan();
      drawLines();
      drawPulses();
      drawParticles();
      rafId = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    frame();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [isDark]);

  const validate = (): boolean => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const passValid = password.length >= 6;
    setEmailErr(!emailValid);
    setPassErr(!passValid);
    setApiError('');
    return emailValid && passValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(email, password);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1800);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen">
      <canvas ref={canvasRef} className="login-canvas" aria-hidden />

      {DECO_SPECS.map((d, i) => (
        <div
          key={i}
          className="login-deco"
          style={{
            width: d.size,
            height: d.size,
            left: d.left,
            background: d.color,
            animation: `login-floatDeco ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}

      <button
        type="button"
        className="theme-btn"
        onClick={toggleTheme}
        title={isDark ? 'Light mode' : 'Dark mode'}
        aria-label="Toggle theme"
      >
        {isDark ? '🌙' : '☀️'}
      </button>

      <div className="login-page-inner">
        <div className="logo-wrap">
          <div className="logo-icon">💊</div>
          <div className="logo-name">MedDist</div>
          <div className="logo-sub">Medicine Distribution Management</div>
        </div>

        <div className="login-card">
          <h2 className="card-title">Sign in</h2>
          {apiError && (
            <div className="field-error show" style={{ marginBottom: 12 }}>
              <span>⚠</span> {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="label" htmlFor="login-email">Email</label>
              <div className="input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className={`login-input ${emailErr ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(false); }}
                  autoComplete="email"
                />
              </div>
              <div className={`field-error ${emailErr ? 'show' : ''}`}>
                <span>⚠</span> Please enter a valid email address
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="login-password">Password</label>
              <div className="input-wrap">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className={`login-input has-eye ${passErr ? 'error' : ''}`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPassErr(false); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className={`field-error ${passErr ? 'show' : ''}`}>
                <span>⚠</span> Password must be at least 6 characters
              </div>
            </div>

            <a href="#" className="forgot" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>

            <button type="submit" className={`btn-signin ${loading ? 'loading' : ''}`} disabled={loading}>
              <span className="btn-text">Sign In</span>
              <div className="login-spinner" />
            </button>
          </form>

          <div className="divider">or continue with</div>
          <div className="sso-row">
            <button type="button" className="sso-btn">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 6.168-2.18l-2.908-2.258c-.806.54-1.837.86-3.26.86-2.513 0-4.646-1.697-5.41-4.043H.653v2.332C2.29 15.98 5.355 18 9 18z"/><path fill="#FBBC05" d="M3.59 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V5.658H.653C.234 6.676 0 7.696 0 8.727s.234 2.05.653 3.045l2.937-2.258z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.355 0 2.29 2.02.653 5.043l2.937 2.332C5.354 1.697 7.487 0 9.997 0 9 0z"/></svg>
              Google
            </button>
            <button type="button" className="sso-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>

        <p className="footer-note">
          Don&apos;t have an account? <a href="#">Contact your admin</a>
        </p>
      </div>

      <div className={`success-overlay ${showSuccess ? 'show' : ''}`} aria-hidden={!showSuccess}>
        <div className="success-box">
          <div className="success-check">✓</div>
          <div className="success-title">Signed in successfully</div>
          <div className="success-sub">Redirecting to dashboard…</div>
        </div>
      </div>
    </div>
  );
}

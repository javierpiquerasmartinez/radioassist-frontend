import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, loginError, loginPending } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel */}
      <div className={styles.brand} aria-hidden="true">
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            Radio<span className={styles.brandAccent}>Assist</span>
          </div>
          <p className={styles.brandTagline}>Informes radiológicos inteligentes</p>
        </div>
        <div className={styles.brandDecor} />
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.subtitle}>Accede a tu cuenta de RadioAssist</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoFocus
                placeholder="tu@email.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className={styles.errorBox} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">!</span>
                {loginError}
              </div>
            )}

            <button type="submit" className={styles.button} disabled={loginPending}>
              {loginPending ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Entrando…
                </>
              ) : 'Entrar'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className={styles.link}>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

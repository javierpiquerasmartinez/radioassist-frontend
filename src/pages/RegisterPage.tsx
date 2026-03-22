import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export function RegisterPage() {
  const { register, registerError, registerPending } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register(email, name, password);
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
          <h1 className={styles.title}>Crear cuenta</h1>
          <p className={styles.subtitle}>Completa los datos para registrarte</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
                autoFocus
                placeholder="Tu nombre"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
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
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            {registerError && (
              <div className={styles.errorBox} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">!</span>
                {registerError}
              </div>
            )}

            <button type="submit" className={styles.button} disabled={registerPending}>
              {registerPending ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Creando cuenta…
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>

          <p className={styles.footer}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className={styles.link}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

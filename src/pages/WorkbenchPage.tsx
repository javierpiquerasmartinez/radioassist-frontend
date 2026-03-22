import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReport } from '../hooks/useReport';
import { useSpeech } from '../hooks/useSpeech';
import styles from './WorkbenchPage.module.css';

export function WorkbenchPage() {
  const { user, logout } = useAuth();
  const {
    dictation, setDictation,
    report, setReport,
    generate, isGenerating, error,
    newPatient,
  } = useReport();

  const { isListening, toggle } = useSpeech((text) =>
    setDictation((prev) => (prev ? `${prev} ${text}` : text))
  );

  const handleCopy = () => {
    if (report) navigator.clipboard.writeText(report);
  };

  const wordCount = dictation.trim().split(/\s+/).filter(Boolean).length;
  const hasSession = dictation.trim().length > 0 || report.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        toggle();
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (dictation.trim()) generate();
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        newPatient();
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [toggle, generate, newPatient, dictation]);

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────── */}
      <header className={styles.header}>
        <strong className={styles.logo}>
          Radio<span className={styles.logoAccent}>Assist</span>
        </strong>

        <div className={styles.sessionIndicator}>
          <span
            className={`${styles.sessionDot} ${hasSession ? styles.sessionDotActive : ''}`}
            aria-hidden="true"
          />
          <span className={styles.sessionLabel}>
            {hasSession ? 'Sesión activa' : 'Nueva sesión'}
          </span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.userName}>{user?.name}</span>
          <Link to="/settings" className={styles.navLink}>Plantillas</Link>
          <button onClick={logout} className={styles.navButton}>Salir</button>
        </nav>
      </header>

      {/* ── Main panels ─────────────────────────────── */}
      <main className={styles.main}>

        {/* Left — Dictado */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <h2 className={styles.panelTitle} id="dictado-label">Dictado</h2>
              {wordCount > 0 && (
                <span className={styles.wordCount} aria-label={`${wordCount} palabras`}>
                  {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
                </span>
              )}
            </div>
            <button
              className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
              onClick={toggle}
              title="Espacio para activar/desactivar"
              aria-label={isListening ? 'Desactivar micrófono' : 'Activar micrófono'}
              aria-pressed={isListening}
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
              <span className={styles.micLabel}>
                {isListening ? 'Escuchando' : 'Micrófono'}
              </span>
            </button>
          </div>
          <textarea
            className={styles.textarea}
            value={dictation}
            onChange={(e) => setDictation(e.target.value)}
            placeholder="Dicta o escribe aquí lo observado en el estudio…"
            aria-labelledby="dictado-label"
          />
        </section>

        {/* Right — Informe */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <h2 className={styles.panelTitle} id="informe-label">Informe</h2>
            </div>
            <div className={styles.statusBadge} aria-hidden="true">
              {isGenerating && (
                <span className={styles.statusGenerating}>
                  <span className={styles.statusSpinner} />
                  Generando
                </span>
              )}
              {!isGenerating && report && (
                <span className={styles.statusReady}>
                  <span className={styles.statusDotGreen} />
                  Listo
                </span>
              )}
            </div>
          </div>
          <textarea
            className={`${styles.textarea} ${styles.textareaReport}`}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="El informe generado aparecerá aquí…"
            readOnly={isGenerating}
            aria-labelledby="informe-label"
            data-has-content={report.length > 0 ? 'true' : undefined}
          />
          <output aria-live="polite" className={styles.srOnly}>
            {!isGenerating && report ? 'Informe generado' : ''}
          </output>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className={styles.footer}>
        {error && (
          <span className={styles.error} role="status">
            <span className={styles.errorIcon} aria-hidden="true">!</span>
            {error}
          </span>
        )}
        <div className={styles.actions}>
          <button
            className={styles.buttonGhost}
            onClick={newPatient}
          >
            Nuevo paciente
            <kbd className={styles.kbd}>⌃N</kbd>
          </button>
          <button
            className={styles.buttonSecondary}
            onClick={handleCopy}
            disabled={!report}
          >
            Copiar
            <kbd className={styles.kbd}>⌃C</kbd>
          </button>
          <button
            className={styles.buttonPrimary}
            onClick={() => generate()}
            disabled={isGenerating || !dictation.trim()}
          >
            {isGenerating ? (
              <>
                <span className={styles.btnSpinner} aria-hidden="true" />
                Generando…
              </>
            ) : 'Generar informe'}
            {!isGenerating && <kbd className={styles.kbd}>⌃↵</kbd>}
          </button>
        </div>
      </footer>
    </div>
  );
}

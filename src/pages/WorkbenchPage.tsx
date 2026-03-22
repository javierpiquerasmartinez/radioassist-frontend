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
      <header className={styles.header}>
        <span className={styles.logo}>RadioAssist</span>
        <nav className={styles.nav}>
          <span className={styles.userName}>{user?.name}</span>
          <Link to="/settings" className={styles.navLink}>Plantillas</Link>
          <button onClick={logout} className={styles.navButton}>Salir</button>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Dictado</h2>
            <button
              className={`${styles.micButton} ${isListening ? styles.micActive : ''}`}
              onClick={toggle}
              title="Espacio para activar/desactivar"
              aria-label={isListening ? 'Desactivar micrófono' : 'Activar micrófono'}
              aria-pressed={isListening}
            >
              {isListening ? '⏹ Escuchando…' : '🎙 Micrófono'}
            </button>
          </div>
          <textarea
            className={styles.textarea}
            value={dictation}
            onChange={(e) => setDictation(e.target.value)}
            placeholder="Dicta o escribe aquí lo observado…"
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Informe</h2>
          </div>
          <textarea
            className={styles.textarea}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="El informe generado aparecerá aquí…"
            readOnly={isGenerating}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        {error && <span className={styles.error}>{error}</span>}
        <div className={styles.actions}>
          <button
            className={styles.buttonPrimary}
            onClick={() => generate()}
            disabled={isGenerating || !dictation.trim()}
          >
            {isGenerating ? 'Generando…' : 'Generar  Ctrl+Enter'}
          </button>
          <button
            className={styles.buttonSecondary}
            onClick={handleCopy}
            disabled={!report}
          >
            Copiar  Ctrl+C
          </button>
          <button
            className={styles.buttonSecondary}
            onClick={newPatient}
          >
            Nuevo paciente  Ctrl+N
          </button>
        </div>
      </footer>
    </div>
  );
}

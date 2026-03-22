import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTemplates } from '../hooks/useTemplates';
import type { Template } from '../types';
import styles from './SettingsPage.module.css';

type EditingState = { id: string | null; name: string; content: string };

const EMPTY: EditingState = { id: null, name: '', content: '' };

export function SettingsPage() {
  const { templates, isLoading, create, update, remove } = useTemplates();
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSelect = (t: Template) => {
    setEditing({ id: t.id, name: t.name, content: t.content });
    setConfirmDelete(null);
  };

  const handleNew = () => {
    setEditing(EMPTY);
    setConfirmDelete(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (editing.id) {
      await update({ id: editing.id, name: editing.name, content: editing.content });
    } else {
      await create({ name: editing.name, content: editing.content });
    }
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setConfirmDelete(null);
    if (editing?.id === id) setEditing(null);
  };

  const charCount = editing?.content.length ?? 0;
  const wordCount = editing
    ? editing.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────── */}
      <header className={styles.header}>
        <Link to="/workbench" className={styles.backLink} aria-label="Volver al workbench">
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>
        <span className={styles.headerTitle}>
          Radio<span className={styles.headerAccent}>Assist</span>
          <span className={styles.breadcrumb}> / Plantillas</span>
        </span>
        <div />
      </header>

      {/* ── Layout ──────────────────────────────── */}
      <div className={styles.layout}>

        {/* ── Sidebar ─────────────────────────── */}
        <aside className={styles.sidebar}>
          <button className={styles.newButton} onClick={handleNew}>
            <span className={styles.newButtonPlus} aria-hidden="true">+</span>
            Nueva plantilla
          </button>

          {isLoading && <p className={styles.muted}>Cargando…</p>}

          <ul className={styles.list}>
            {templates.map((t) => (
              <li
                key={t.id}
                className={`${styles.item} ${editing?.id === t.id ? styles.itemActive : ''}`}
              >
                <button className={styles.itemBody} onClick={() => handleSelect(t)}>
                  <span className={styles.itemName}>{t.name}</span>
                  <span className={styles.itemPreview}>
                    {t.content.slice(0, 60)}{t.content.length > 60 ? '…' : ''}
                  </span>
                </button>

                {confirmDelete === t.id ? (
                  <span className={styles.confirmRow}>
                    <button
                      className={styles.confirmYes}
                      onClick={() => handleDelete(t.id)}
                    >
                      Eliminar
                    </button>
                    <button
                      className={styles.confirmNo}
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setConfirmDelete(t.id)}
                    aria-label={`Eliminar plantilla ${t.name}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                      <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Editor ──────────────────────────── */}
        <main className={styles.editor}>
          {editing ? (
            <>
              <input
                className={styles.nameInput}
                placeholder="Nombre de la plantilla"
                aria-label="Nombre de la plantilla"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />

              <div className={styles.toolbar}>
                <span className={styles.toolbarStat}>
                  {charCount} {charCount === 1 ? 'carácter' : 'caracteres'}
                </span>
                <span className={styles.toolbarDivider} aria-hidden="true">·</span>
                <span className={styles.toolbarStat}>
                  {wordCount} {wordCount === 1 ? 'palabra' : 'palabras'}
                </span>
              </div>

              <textarea
                className={styles.contentArea}
                placeholder="Contenido de la plantilla…"
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />

              <div className={styles.editorActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={!editing.name.trim() || !editing.content.trim()}
                >
                  Guardar plantilla
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>Ninguna plantilla seleccionada</p>
              <p className={styles.emptyHint}>
                Selecciona una plantilla de la lista o crea una nueva.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

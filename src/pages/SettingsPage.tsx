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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Plantillas</h1>
        <Link to="/workbench" className={styles.back}>← Volver al workbench</Link>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <button className={styles.newButton} onClick={handleNew}>+ Nueva plantilla</button>

          {isLoading && <p className={styles.muted}>Cargando…</p>}

          <ul className={styles.list}>
            {templates.map((t) => (
              <li
                key={t.id}
                className={`${styles.item} ${editing?.id === t.id ? styles.itemActive : ''}`}
              >
                <button className={styles.itemName} onClick={() => handleSelect(t)}>
                  {t.name}
                </button>
                {confirmDelete === t.id ? (
                  <span className={styles.confirmRow}>
                    <button className={styles.confirmYes} onClick={() => handleDelete(t.id)}>Eliminar</button>
                    <button className={styles.confirmNo} onClick={() => setConfirmDelete(null)}>Cancelar</button>
                  </span>
                ) : (
                  <button className={styles.deleteBtn} onClick={() => setConfirmDelete(t.id)}>✕</button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className={styles.editor}>
          {editing ? (
            <>
              <input
                className={styles.nameInput}
                placeholder="Nombre de la plantilla"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <textarea
                className={styles.contentArea}
                placeholder="Contenido de la plantilla…"
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />
              <div className={styles.editorActions}>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={!editing.name.trim() || !editing.content.trim()}
                >
                  Guardar
                </button>
                <button className={styles.cancelButton} onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <p className={styles.emptyHint}>Selecciona una plantilla o crea una nueva.</p>
          )}
        </main>
      </div>
    </div>
  );
}

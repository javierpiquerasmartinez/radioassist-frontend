# RadioAssist — API Contract

> **Base URL:** `http://localhost:3000` (dev) / production URL via env
> **Docs interactivos:** `GET /api/docs` (Swagger UI)
> **Autenticación:** Bearer JWT en header `Authorization: Bearer <token>`

---

## Tipos compartidos

```typescript
// Error uniforme
type ApiError = {
  error: string;
  code?: string;
};

// Mensaje de sesión (gestionado por el frontend)
type SessionMessage = {
  role: "user" | "assistant";
  content: string;
};
```

---

## Health

### `GET /health`
Comprueba que el servidor está levantado. Público.

**Response `200`**
```json
{ "status": "ok" }
```

---

## Auth

### `POST /api/auth/register`
Registra un nuevo radiólogo. Público.

**Body**
```typescript
{
  email: string;    // formato email válido
  name: string;     // mínimo 1 carácter
  password: string; // mínimo 8 caracteres
}
```

**Response `201`**
```typescript
{
  id: string;        // uuid
  email: string;
  name: string;
  preferences: object;
  createdAt: string; // ISO 8601
}
```

**Errores**
| Status | Motivo |
|--------|--------|
| 400 | Datos inválidos |
| 409 | El email ya está registrado |

---

### `POST /api/auth/login`
Devuelve un JWT. Público.

**Body**
```typescript
{
  email: string;
  password: string;
}
```

**Response `200`**
```typescript
{
  token: string; // JWT — expira según JWT_EXPIRES_IN (default 7d)
}
```

**Errores**
| Status | Motivo |
|--------|--------|
| 401 | Credenciales incorrectas |

---

### `GET /api/auth/me`
Perfil del radiólogo autenticado. 🔒

**Response `200`**
```typescript
{
  id: string;
  email: string;
  name: string;
  preferences: object;
  createdAt: string; // ISO 8601
  templates: Template[];
}
```

**Errores**
| Status | Motivo |
|--------|--------|
| 401 | Token ausente o inválido |

---

## Templates

Tipo base:
```typescript
type Template = {
  id: string;        // uuid
  userId: string;
  name: string;
  content: string;   // texto libre con la estructura del informe
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
```

---

### `GET /api/templates` 🔒
Devuelve los templates del usuario autenticado.

**Response `200`**
```typescript
Template[]
```

---

### `POST /api/templates` 🔒
Crea un template.

**Body**
```typescript
{
  name: string;    // mínimo 1 carácter
  content: string; // mínimo 1 carácter
}
```

**Response `201`**
```typescript
Template
```

**Errores**
| Status | Motivo |
|--------|--------|
| 400 | Datos inválidos |
| 401 | No autenticado |

---

### `PUT /api/templates/:id` 🔒
Actualiza un template.

**Params:** `id: string` (uuid del template)

**Body**
```typescript
{
  name: string;    // mínimo 1 carácter
  content: string; // mínimo 1 carácter
}
```

**Response `200`**
```typescript
Template
```

**Errores**
| Status | Motivo |
|--------|--------|
| 400 | Datos inválidos |
| 401 | No autenticado |
| 404 | Template no encontrado |

---

### `DELETE /api/templates/:id` 🔒
Elimina un template.

**Params:** `id: string`

**Response `204`** _(sin body)_

**Errores**
| Status | Motivo |
|--------|--------|
| 401 | No autenticado |
| 404 | Template no encontrado |

---

## Reports

Tipo base:
```typescript
type Report = {
  id: string;               // uuid
  userId: string;
  sessionId: string | null; // agrupa informes de la misma sesión
  templateUsed: string;     // nombre del template detectado
  originalDictation: string;
  generatedReport: string;
  createdAt: string;        // ISO 8601
};
```

---

### `POST /api/reports/generate` 🔒
Endpoint principal. Envía una dictación al modelo de IA y devuelve el informe o una pregunta de aclaración.

**Body**
```typescript
{
  dictation: string;              // texto dictado por el radiólogo, mínimo 1 carácter
  sessionId?: string;             // uuid — agrupa informes del mismo paciente
  sessionHistory?: SessionMessage[]; // historial de la sesión actual (default [])
}
```

**Response `200`**
```typescript
{
  type: "report" | "question";
  content: string;           // informe generado o pregunta de la IA
  templateDetected?: string; // nombre del template que la IA seleccionó
}
```

> **Lógica de sesión (responsabilidad del frontend):**
> - Mantener `sessionHistory` acumulando los mensajes de la conversación actual.
> - Si `type === "report"` → el informe se ha guardado en BBDD; limpiar `sessionHistory` y generar un nuevo `sessionId` al pasar al siguiente paciente.
> - Si `type === "question"` → añadir la pregunta de la IA al historial y esperar la respuesta del radiólogo antes de volver a llamar.

**Errores**
| Status | Motivo |
|--------|--------|
| 400 | Datos inválidos |
| 401 | No autenticado |

---

### `GET /api/reports` 🔒
Historial de informes del usuario autenticado, ordenado por fecha descendente.

**Response `200`**
```typescript
Report[]
```

**Errores**
| Status | Motivo |
|--------|--------|
| 401 | No autenticado |

---

## Flujo típico

```
1. POST /api/auth/login          → obtener token
2. GET  /api/auth/me             → cargar perfil + templates
3. POST /api/reports/generate    → generar informe
   ├─ type === "question"  → mostrar pregunta, añadir al historial, repetir paso 3
   └─ type === "report"    → mostrar informe, limpiar sesión
4. GET  /api/reports             → ver historial
```

---

## Notas de privacidad

- El backend **nunca** almacena nombre de paciente ni datos identificativos.
- La responsabilidad de anonimización recae en el radiólogo.
- `sessionId` es un UUID opaco generado por el frontend; no referencia ningún dato del paciente.

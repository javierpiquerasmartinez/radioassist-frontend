# RadioAssist — Especificación Técnica y Funcional
**Versión:** 1.0 · **Fecha:** Marzo 2026 · **Estado:** Borrador

---

## 1. Visión General

RadioAssist es una herramienta web de asistencia inteligente diseñada para agilizar la generación de informes radiológicos. En su primera versión está orientada exclusivamente a radiólogos especializados en mama, con vocación de escalarse al resto de subespecialidades.

El núcleo del producto es simple: el radiólogo dicta o escribe lo que ha observado, y la IA genera automáticamente el informe estructurado usando sus propias plantillas y preferencias de estilo.

### Objetivo principal

- Reducir el tiempo de generación de informes radiológicos al mínimo posible.
- Permitir que el radiólogo se concentre en el diagnóstico, no en la redacción.
- Garantizar consistencia y calidad respetando el estilo de cada profesional.

### Alcance v1.0

| Ámbito | Detalle |
|---|---|
| Incluido | Dictado por voz, generación con plantillas, historial de sesión, perfil por radiólogo, app web independiente |
| Excluido | Integración con HIS/PACS, extensión de navegador, widget embebible, otras especialidades |
| Roadmap futuro | Widget embebible para integración universal, apertura a otras subespecialidades |

---

## 2. Flujo Funcional

### 2.1 Configuración inicial (una sola vez por radiólogo)

1. El radiólogo crea su cuenta y accede a su panel de configuración.
2. Define sus plantillas en texto libre (puede tener varias: mamografía screening, ecografía mamaria, biopsia, etc.).
3. Opcionalmente añade instrucciones generales de estilo: idioma, nivel de formalidad, campos a incluir siempre, etc.

### 2.2 Ciclo de trabajo por paciente

```
1. Pulsa el botón micrófono (o atajo Espacio) → dicta lo observado
2. Revisa el texto transcrito (editable antes de enviar)
3. Pulsa 'Generar informe' (o Ctrl+Enter)
4. La IA selecciona la plantilla correcta y genera el informe
5. El radiólogo revisa y edita si es necesario
6. Pulsa 'Copiar' (Ctrl+C) → pega en su sistema habitual
7. Pulsa 'Nuevo paciente' (Ctrl+N) → pantalla limpia en < 1 segundo
```

### 2.3 Modos de dictado

| Modo | Descripción |
|---|---|
| Dictado en tiempo real | El radiólogo dicta mientras explora las imágenes. El texto se acumula y se envía al finalizar. |
| Dictado posterior | El radiólogo explora primero y luego dicta el resumen completo. |
| Modo mixto | Puede pausar y reanudar el dictado en cualquier momento dentro de la misma sesión de paciente. |

---

## 3. Sistema de Plantillas e IA

### 3.1 Gestión de plantillas

- Las plantillas son texto libre escrito por el propio radiólogo (no se suben archivos externos).
- Cada radiólogo puede tener múltiples plantillas, cada una con un nombre identificativo.
- Ejemplos de plantillas típicas en mama: mamografía de screening, mamografía diagnóstica, ecografía mamaria, punción/biopsia guiada por ecografía, RM mamaria.

### 3.2 Selección automática de plantilla

La IA analiza el dictado e identifica automáticamente qué tipo de estudio es, seleccionando la plantilla correspondiente sin intervención del usuario. Esto se implementa en una única llamada al modelo:

```
System prompt = instrucciones del radiólogo
              + todas sus plantillas disponibles
              + regla: identifica el tipo de estudio y usa la plantilla correcta

User message  = dictado del radiólogo

Respuesta     = informe estructurado y completo
```

### 3.3 Comportamiento de la generación

- Solo se completan los campos que el radiólogo haya mencionado en el dictado.
- Los campos sin información se marcan como "No valorado" o se dejan vacíos según la plantilla.
- La IA respeta el estilo, terminología y preferencias definidas por el radiólogo.
- Si el dictado es ambiguo o incompleto, la IA pregunta antes de generar.

### 3.4 Campos obligatorios vs opcionales

Se recomienda marcar en cada plantilla qué campos son obligatorios:

```
[MAMOGRAFÍA SCREENING]
Indicación:               [OBLIGATORIO]
Técnica:                  [OBLIGATORIO]
Hallazgos mama derecha:   [OBLIGATORIO]
Hallazgos mama izquierda: [OBLIGATORIO]
Comparación con previos:  [OPCIONAL - omitir si no se menciona]
Categoría BIRADS:         [OBLIGATORIO]
Recomendación:            [OBLIGATORIO]
```

---

## 4. Gestión del Contexto de IA

El modelo de IA no tiene memoria entre llamadas. Es la aplicación quien gestiona y envía el contexto en cada petición.

### 4.1 Tres capas de contexto

| Capa | Persistencia | Contenido |
|---|---|---|
| System prompt | Permanente por radiólogo | Plantillas + instrucciones de estilo + preferencias. Se construye al iniciar sesión. |
| Historial de sesión | Solo dentro del paciente actual | Los turnos de conversación del caso en curso. Permite refinamientos posteriores. |
| Mensaje actual | Por cada llamada | El dictado o instrucción concreta del radiólogo. |

### 4.2 Estrategia de historial

- El historial se mantiene solo durante la sesión del paciente actual, no entre pacientes.
- Al pulsar "Nuevo paciente", el historial se limpia. El system prompt permanece.
- Esto evita contaminación de contexto entre casos y reduce el consumo de tokens.
- El radiólogo puede refinar el informe generado con instrucciones adicionales dentro del mismo paciente.

### 4.3 Restricciones de la IA

**Restricción de propósito:** El modelo solo puede ayudar con la generación de informes radiológicos. Ante cualquier otro uso, declina educadamente.

**Manejo de información incompleta:** Si el dictado no contiene suficiente información para completar los campos obligatorios, el modelo no inventa datos. En su lugar hace preguntas concretas y numeradas, y espera respuesta antes de generar el informe.

---

## 5. Privacidad y Gestión de Datos

### 5.1 Principio de separación de datos

| Categoría | Detalle |
|---|---|
| Guardado en BD | Historial anonimizado, plantillas, preferencias, configuración del radiólogo |
| Nunca toca el servidor | Nombre real del paciente ni ningún dato identificativo directo |
| Responsabilidad del hospital | La asociación entre ID interno y nombre del paciente |

### 5.2 Historial de informes

- Cada entrada contiene: fecha, tipo de estudio (plantilla usada), dictado original, informe generado.
- Sin nombre de paciente. El radiólogo puede anotar opcionalmente un ID interno de su sistema.
- El historial es privado por radiólogo, no compartido entre usuarios.
- Esta decisión simplifica el cumplimiento de GDPR/LOPD.

---

## 6. Arquitectura Técnica

### 6.1 Repositorios

Dos repositorios independientes para permitir despliegues y escalados por separado:

```
radioassist-backend/    Node.js + Express + TypeScript
radioassist-frontend/   React
```

El frontend nunca llama directamente a la API de Anthropic. Siempre pasa por el backend. Esto protege la API key y centraliza la lógica de negocio.

```
React → backend propio → Anthropic API
                ↑
         aquí vive la API key
         aquí se construye el system prompt
         aquí se guarda el historial
```

### 6.2 Stack tecnológico

| Capa | Tecnología | Función |
|---|---|---|
| Frontend | React | SPA con dictado por voz, editor de informe, gestión de plantillas |
| Backend | Node.js + Express + TypeScript | API REST: auth, gestión de contexto, llamadas al modelo IA |
| Base de datos | PostgreSQL + Prisma | Usuarios, plantillas, historial anonimizado |
| Autenticación | JWT | Sesión por radiólogo, contexto aislado |
| Modelo IA | Claude Haiku (Anthropic) | Generación de informes |
| Voz a texto | Web Speech API | Dictado nativo en navegador, sin coste adicional |
| Editor de texto | TipTap o Quill | Edición del informe generado antes de copiar |

### 6.3 Modelo de datos

```prisma
model Usuario {
  id           String    @id @default(uuid())
  email        String    @unique
  nombre       String
  passwordHash String
  preferencias Json      @default("{}")
  plantillas   Plantilla[]
  historial    HistorialInforme[]
  createdAt    DateTime  @default(now())
}

model Plantilla {
  id        String   @id @default(uuid())
  usuarioId String
  usuario   Usuario  @relation(fields: [usuarioId], references: [id])
  nombre    String
  contenido String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HistorialInforme {
  id              String   @id @default(uuid())
  usuarioId       String
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  plantillaUsada  String
  dictadoOriginal String
  informeGenerado String
  createdAt       DateTime @default(now())
  // NUNCA almacenar nombre ni datos identificativos del paciente
}
```

### 6.4 Endpoints

**Auth**
```
POST  /api/auth/register   Registro de nuevo radiólogo
POST  /api/auth/login      Login, devuelve JWT
GET   /api/auth/me         Perfil del radiólogo autenticado
```

**Plantillas** (requieren JWT)
```
GET    /api/plantillas        Lista plantillas del radiólogo autenticado
POST   /api/plantillas        Crear plantilla
PUT    /api/plantillas/:id    Editar plantilla
DELETE /api/plantillas/:id    Eliminar plantilla
```

**Informes** (requieren JWT)
```
POST  /api/informes/generar   Endpoint principal — genera informe con IA
GET   /api/informes           Historial del radiólogo autenticado
```

### 6.5 Contrato del endpoint principal

`POST /api/informes/generar`

```json
// Request
{
  "dictado": "Texto que ha dictado el radiólogo",
  "historialSesion": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

// Response
{
  "tipo": "informe" | "pregunta",
  "contenido": "Texto del informe o pregunta de la IA",
  "plantillaDetectada": "Mamografía screening"
}
```

Si `tipo` es `"pregunta"`, el frontend no limpia la sesión ni guarda en historial — espera la respuesta del radiólogo y vuelve a llamar al endpoint con el historial actualizado.

### 6.6 Autenticación JWT

El flujo de autenticación tiene dos fases:

**Fase 1 — Login:**
```
POST /api/auth/login { email, password }
  → verifica password con bcrypt
  → genera JWT firmado con JWT_SECRET (payload: { usuarioId })
  → devuelve { token }
```

**Fase 2 — Requests autenticados:**
```
Header: Authorization: Bearer <token>
  → middleware verifica firma con JWT_SECRET
  → extrae usuarioId y lo inyecta en req.user
  → cada query filtra por ese usuarioId
```

El aislamiento de datos entre radiólogos se garantiza estructuralmente: todos los queries llevan `where: { usuarioId: req.user.usuarioId }`.

---

## 7. Experiencia de Usuario

### 7.1 Principio de diseño

La velocidad de transición entre pacientes es prioridad de primer nivel. Un radiólogo puede generar 30-50 informes en una mañana: cada segundo extra por informe impacta directamente en su jornada.

### 7.2 Atajos de teclado

| Atajo | Acción |
|---|---|
| `Espacio` (mantener) | Activar/desactivar micrófono |
| `Ctrl + Enter` | Generar informe |
| `Ctrl + C` | Copiar informe al portapapeles |
| `Ctrl + N` | Nuevo paciente (limpia todo en < 1 segundo) |
| `Ctrl + Z` | Deshacer última edición en el informe |

### 7.3 Principios de la interfaz

- Pantalla única: dictado, generación y copia en la misma vista, sin navegación.
- "Nuevo paciente" en un solo clic: limpia dictado, informe e historial de sesión. El foco vuelve automáticamente al micrófono.
- Sin modales de confirmación para acciones frecuentes.
- Indicador visual claro del estado del micrófono: escuchando / procesando / listo.

---

## 8. Modelo IA y Costes

### 8.1 Modelo recomendado

**Claude Haiku** (`claude-haiku-4-5`) para v1.0. Para estructurar texto con plantillas predefinidas es más que suficiente. Si se requiere mayor capacidad de razonamiento clínico, escalar a Claude Sonnet.

| Modelo | Coste | Valoración |
|---|---|---|
| Claude Haiku | Muy bajo (< 0,01 €/informe) | Recomendado para v1.0 |
| Claude Sonnet | Bajo-medio | Alternativa para casos complejos |
| Modelos open source | Infraestructura propia | Mayor complejidad, peor calidad. No recomendado. |

### 8.2 Estimación de costes

- Coste estimado por informe: < 0,01 € con Claude Haiku.
- Para un radiólogo que genera 40 informes/día: < 0,40 €/día, ~8 €/mes.
- El coste crece linealmente con el uso, sin infraestructura fija de IA.

---

## 9. Roadmap

| Versión | Alcance | Funcionalidades |
|---|---|---|
| v1.0 — MVP | Mamografía | App web, dictado por voz, plantillas en texto libre, historial anonimizado, perfil por radiólogo |
| v1.1 | Todas las especialidades | Apertura a radiólogos de otras subespecialidades |
| v2.0 | Integración universal | Widget embebible (`<script>`) para cualquier app web del hospital |
| v2.x | Integración HIS/PACS | Conexión directa con sistemas de gestión hospitalaria |

---

## 10. Resumen Ejecutivo

| | |
|---|---|
| **Producto** | App web para generación automática de informes radiológicos por IA |
| **Usuarios objetivo** | Radiólogos de mama (v1.0), extensible al resto de especialidades |
| **Stack** | React + Node/Express + TypeScript + PostgreSQL + API Claude (Anthropic) |
| **Privacidad** | Nunca se almacena el nombre del paciente. Historial anonimizado. |
| **Coste IA** | < 0,01 € por informe generado con Claude Haiku |
| **Diferencial clave** | Transición entre pacientes en < 1 segundo. Flujo optimizado para velocidad clínica. |
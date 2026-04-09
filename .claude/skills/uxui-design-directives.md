---
name: vs-ingenieria-ui-directives
description: >
  Directivas de diseño UI/UX para VS Ingeniería en Sistemas. Usar siempre que
  se construya o describa un componente visual concreto: dashboards, tablas,
  gráficos, formularios, modales, sidebars, tarjetas de métricas, listas,
  navegación, badges de estado, tooltips, o cualquier elemento interactivo.
  Complementa la skill vs-ingenieria-design-system (tokens de color, fuentes,
  espaciado) con reglas específicas de composición, comportamiento y estilo
  visual oscuro. Activar ante términos: "dashboard", "tabla", "gráfico",
  "componente", "pantalla", "vista", "sidebar", "métrica", "KPI", "card",
  "modal", "formulario", "lista", "interacción", "hover", "estado", "animación".
  IMPORTANTE: Leer siempre junto con vs-ingenieria-design-system para tokens.
---

# VS Ingeniería en Sistemas — Directivas UI/UX

Directivas específicas de construcción de interfaces. Los valores de color, fuente
y espaciado se importan desde la skill `vs-ingenieria-design-system`. Esta skill
define **cómo se construyen** los componentes, no los tokens base.

> **Modo visual por defecto:** Dark UI. Todas las interfaces de gestión, dashboards
> y herramientas internas se construyen sobre fondos oscuros. El modo claro aplica
> solo a portales públicos o documentación.

---

## 1. Fondos y Capas (Dark UI)

Las interfaces usan un sistema de capas con profundidad creciente:

```
Capa 0 — Fondo base de la app:      #0B1E27   (más oscuro que vs-navy)
Capa 1 — Sidebar / nav lateral:     #0F2633
Capa 2 — Superficie de página:      #132D3A   (body / área de contenido)
Capa 3 — Tarjetas / paneles:        #1A3D4F   (vs-navy)
Capa 4 — Tarjetas elevadas / hover: #1F5F72   (vs-deep)
Capa 5 — Elementos activos:         #2B8EA6   (vs-teal)
```

**Efecto glassmorphism (uso selectivo):**
```css
/* Solo para paneles flotantes, modales y tooltips destacados */
.glass-panel {
  background: rgba(26, 61, 79, 0.60);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(77, 200, 232, 0.15);
  border-radius: var(--radius-lg);
}
```

**Fondo con textura sutil (opcional para hero/header):**
```css
/* Patrón de puntos muy sutil, evoca circuitos */
.bg-pattern {
  background-color: #0B1E27;
  background-image: radial-gradient(rgba(77,200,232,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## 2. Layout de Aplicación

### Estructura Principal

```
┌─────────────────────────────────────────────────┐
│  TOPBAR (64px altura fija)                       │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ SIDEBAR  │        CONTENT AREA                  │
│ (240px   │        padding: 32px                 │
│ colaps.  │        overflow-y: auto              │
│ a 64px)  │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

### Sidebar

- **Ancho expandido:** `240px` | **Colapsado:** `64px`
- **Fondo:** Capa 1 (`#0F2633`)
- **Transición colapso:** `width 0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- **Ítem de nav activo:** fondo `vs-teal` con opacidad `0.15`, borde izquierdo `3px solid vs-cyan`, texto `vs-cyan`
- **Ítem hover:** fondo `rgba(77,200,232,0.07)`, texto blanco
- **Íconos:** Lucide, 20px, stroke 1.5
- **Logo:** 32px alto, padding `24px` vertical en header del sidebar
- **Separadores de grupo:** línea `1px solid rgba(255,255,255,0.06)`, label de grupo en mayúsculas 10px, color `vs-gray-dark`

```css
.nav-item { padding: 10px 16px; border-radius: var(--radius-md); gap: 12px; }
.nav-item.active {
  background: rgba(43,142,166,0.15);
  border-left: 3px solid #4DC8E8;
  color: #4DC8E8;
}
.nav-item:hover:not(.active) { background: rgba(77,200,232,0.07); }
```

### Topbar

- **Altura:** `64px`, `position: sticky; top: 0; z-index: 100`
- **Fondo:** `rgba(11, 30, 39, 0.85)` + `backdrop-filter: blur(12px)`
- **Borde inferior:** `1px solid rgba(77, 200, 232, 0.10)`
- Contiene: breadcrumb / título de página a la izquierda; buscador, notificaciones, avatar a la derecha
- **Avatar:** 36px, `border-radius: full`, borde `2px solid vs-teal`

---

## 3. KPI Cards / Tarjetas de Métricas

Inspiradas en las referencias: números grandes, cambio porcentual, ícono de tendencia.

```css
.kpi-card {
  background: #1A3D4F;              /* Capa 3 */
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* Decoración de fondo opcional — forma abstracta difuminada */
.kpi-card::after {
  content: '';
  position: absolute;
  right: -20px; top: -20px;
  width: 80px; height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(77,200,232,0.12) 0%, transparent 70%);
  pointer-events: none;
}
```

**Anatomía de una KPI card:**
```
┌────────────────────────────────┐
│ [Ícono]  Etiqueta              │  ← label: Inter 12px, vs-gray-mid
│                                │
│  $ 99.560          ↗           │  ← valor: Montserrat 28px Bold, blanco
│                                │
│  +2.6%  vs mes anterior        │  ← badge verde/rojo + texto 12px
└────────────────────────────────┘
```

**Badge de variación:**
```css
.badge-positive { background: rgba(34,197,94,0.15); color: #4ADE80; }
.badge-negative { background: rgba(239,68,68,0.15);  color: #F87171; }
.badge-neutral  { background: rgba(77,200,232,0.15); color: #4DC8E8; }
/* padding: 2px 8px; border-radius: full; font-size: 11px; font-weight: 600 */
```

---

## 4. Tablas de Datos

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}
.data-table thead th {
  background: #0F2633;
  color: #B0BEC5;          /* vs-gray-mid */
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(77,200,232,0.12);
}
.data-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.data-table tbody tr:hover { background: rgba(77,200,232,0.05); }
.data-table td { padding: 12px 16px; color: #E0E8EF; }
```

**Reglas de tablas:**
- Primera columna: checkbox (16px) + identificador en `vs-cyan` con font-weight 500
- Columna de estado: siempre badge con color semántico (ver estados abajo)
- Columna de acciones: ícono `...` (MoreHorizontal) que abre un dropdown
- Filas alternas NO usan `zebra striping` — se usa solo el hover
- Paginación: a la derecha, estilo `1 of 18 ‹ ›`, flechas como íconos Lucide

**Toolbar de tabla:**
```
[🔍 Search input]  [Filtros activos como pills]  |  [Export]  [Sort]  [+ Acción primaria]
```
- El botón de acción primaria (`+ Nuevo`) usa `btn-primary` con gradiente de marca
- Export y Sort son botones ghost con borde sutil

---

## 5. Gráficos y Visualizaciones

**Librería recomendada:** Recharts (React) o Chart.js. Configurar con el tema VS:

### Paleta de series para gráficos
```js
const VS_CHART_COLORS = [
  '#4DC8E8',  // vs-cyan — serie principal
  '#2B8EA6',  // vs-teal — serie secundaria
  '#1F5F72',  // vs-deep — serie terciaria
  '#4ADE80',  // verde suave — positivo
  '#F87171',  // rojo suave — negativo/alerta
  '#FBBF24',  // ámbar — advertencia
  '#A78BFA',  // violeta — cuarta serie
];
```

### Barras (Bar Chart)
- Fondo de contenedor: Capa 3 (`#1A3D4F`), `border-radius: 16px`, padding `24px`
- Barras: fill `vs-cyan` con opacidad `0.85`; barra seleccionada/hover: `vs-teal` opacidad `1` + `shadow-glow`
- `barSize: 28`, `barCategoryGap: '30%'`
- Eje Y: líneas guía `rgba(255,255,255,0.06)`, labels `vs-gray-mid` 11px
- Eje X: sin línea de eje visible, labels `vs-gray-mid` 11px
- Tooltip: fondo `#0B1E27`, borde `1px solid rgba(77,200,232,0.3)`, border-radius `8px`
- NO usar grid horizontal llamativo — líneas solo `rgba(255,255,255,0.05)`

### Donut / Pie Chart
- `innerRadius: 55%`, `outerRadius: 80%` — preferir donut sobre pie
- Centro del donut: métrica clave en texto grande blanco + label pequeño gris
- Leyenda: a la derecha con punto de color (8px círculo) + label + valor
- Stroke entre segmentos: `2px solid #0B1E27` para separación visual

### Line / Area Chart
- Línea: `stroke: vs-cyan`, `strokeWidth: 2`
- Área bajo la curva: gradiente vertical `vs-cyan` → transparente, opacidad `0.12`
- Puntos: `r: 4`, fill `vs-cyan`, borde `2px white`; visible solo en hover
- `type="monotone"` para curvas suaves

### Micro-charts (Sparklines)
- Usarlos dentro de KPI cards para mostrar tendencia
- Sin ejes, sin labels, solo la línea o área
- Altura: `40px`, ancho: `80–100px`, alineados a la derecha de la card

---

## 6. Estados y Feedback Visual

### Badges de Estado (Status Pills)
```css
/* Base */
.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: var(--radius-full);
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em;
}
/* Punto indicador */
.status-badge::before {
  content: ''; width: 6px; height: 6px;
  border-radius: 50%; background: currentColor;
}

.status-active    { background: rgba(34,197,94,0.15);  color: #4ADE80; }
.status-pending   { background: rgba(251,191,36,0.15); color: #FBBF24; }
.status-inactive  { background: rgba(239,68,68,0.15);  color: #F87171; }
.status-info      { background: rgba(77,200,232,0.15); color: #4DC8E8; }
.status-draft     { background: rgba(176,190,197,0.12);color: #B0BEC5; }
```

**Mapa semántico de colores de estado:**
| Estado           | Color texto | Uso típico                        |
|------------------|-------------|-----------------------------------|
| Activo / Entregado | `#4ADE80` | Completado, online, pagado        |
| Pendiente / Espera | `#FBBF24` | En proceso, esperando             |
| Error / Rechazado  | `#F87171` | Fallido, vencido, cancelado       |
| Info / En camino   | `#4DC8E8` | En tránsito, informativo          |
| Borrador           | `#B0BEC5` | No publicado, sin enviar          |

### Loading States
- Skeleton loaders: fondo `rgba(255,255,255,0.05)`, animación `shimmer` de izquierda a derecha
- Spinners: `vs-cyan`, `border-radius: full`, `border-top` coloreado, resto `rgba(255,255,255,0.1)`
- Duración de animaciones de carga: `1.4s linear infinite`

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(77,200,232,0.08) 50%,
    rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-sm);
}
```

---

## 7. Formularios e Inputs

```css
.input {
  background: #0F2633;
  border: 1px solid rgba(77,200,232,0.20);
  border-radius: var(--radius-md);
  color: #E0E8EF;
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}
.input::placeholder { color: #546E7A; }
.input:focus {
  outline: none;
  border-color: #4DC8E8;
  box-shadow: 0 0 0 3px rgba(77,200,232,0.15);
}
.input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Input con ícono prefijo */
.input-group { position: relative; }
.input-group .icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #546E7A; }
.input-group .input { padding-left: 40px; }

/* Label */
.label { font-size: 12px; font-weight: 600; color: #B0BEC5; margin-bottom: 6px; letter-spacing: 0.04em; }

/* Error */
.input-error { border-color: #F87171; }
.input-error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }
.error-msg { font-size: 11px; color: #F87171; margin-top: 4px; }
```

**Select / Dropdown:**
- Mismo estilo que `.input`
- Chevron personalizado: ícono Lucide `ChevronDown` en `vs-gray-dark`
- Panel de opciones: fondo `#0B1E27`, borde `1px solid rgba(77,200,232,0.2)`, border-radius `8px`, `box-shadow: var(--shadow-lg)`
- Opción hover: `background: rgba(77,200,232,0.08)`
- Opción seleccionada: `background: rgba(43,142,166,0.20)`, check `vs-cyan`

**Search Input:**
- Ícono `Search` a la izquierda, color `vs-gray-dark`
- Al enfocar: borde `vs-cyan` + glow sutil
- Ancho mínimo: `200px`, expandible con `transition: width 0.3s`

---

## 8. Modales y Paneles Flotantes

```css
/* Overlay */
.modal-overlay {
  background: rgba(11, 30, 39, 0.75);
  backdrop-filter: blur(4px);
}

/* Panel */
.modal {
  background: #132D3A;
  border: 1px solid rgba(77,200,232,0.15);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 64px rgba(0,0,0,0.50);
  max-width: 560px;
  width: 90%;
}
.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-body    { padding: 24px; }
.modal-footer  { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 12px; justify-content: flex-end; }
```

**Animación de entrada:**
```css
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.modal { animation: modal-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
```

**Side Panel (Drawer):**
- Ancho: `480px` (desktop) / `100%` (mobile)
- Desliza desde la derecha: `transform: translateX(100%)` → `translateX(0)`, `transition: 0.3s`
- Mismo esquema de fondos y bordes que el modal

---

## 9. Interacciones y Micro-animaciones

### Principios
- **Duración:** acciones rápidas `150ms`, transiciones de estado `200–300ms`, animaciones de entrada `200–400ms`
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` para movimientos; `cubic-bezier(0.34, 1.56, 0.64, 1)` para "spring" (apariciones)
- **No animar** propiedades que causan reflow (`width`, `height`, `top/left`) — preferir `transform` y `opacity`

### Catálogo de Interacciones

| Elemento            | Hover                                          | Active / Pressed                        |
|---------------------|------------------------------------------------|-----------------------------------------|
| Botón primario      | `opacity: 0.9` + `shadow-glow`                | `scale(0.98)` + `opacity: 0.85`         |
| Botón secundario    | Fondo `vs-teal`, texto blanco                 | `scale(0.97)`                           |
| KPI Card            | `translateY(-2px)` + `shadow-glow`            | `translateY(0)`                         |
| Fila de tabla       | Fondo `rgba(77,200,232,0.05)`                 | Fondo `rgba(77,200,232,0.10)`           |
| Nav ítem sidebar    | Fondo `rgba(77,200,232,0.07)`                 | Fondo `rgba(77,200,232,0.12)`           |
| Ícono de acción     | Color `vs-cyan` + rotación ligera `scale(1.1)`| `scale(0.95)`                           |
| Link / texto        | Color `vs-cyan`, `underline`                  | `opacity: 0.8`                          |

### Notificaciones / Toasts
```css
.toast {
  background: #1A3D4F;
  border: 1px solid rgba(77,200,232,0.20);
  border-left: 4px solid; /* color según tipo */
  border-radius: var(--radius-md);
  padding: 14px 18px;
  box-shadow: var(--shadow-lg);
  min-width: 300px;
}
/* Posición: bottom-right, apilados con gap 8px */
/* Entrada: slideUp + fadeIn 300ms; Salida: fadeOut 200ms */
```

---

## 10. Filtros y Chips Activos

```css
.filter-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(43,142,166,0.20);
  border: 1px solid rgba(43,142,166,0.40);
  color: #4DC8E8;
  border-radius: var(--radius-full);
  padding: 4px 12px;
  font-size: 12px; font-weight: 500;
}
/* Botón × para eliminar filtro */
.filter-chip .remove { color: #4DC8E8; opacity: 0.7; cursor: pointer; }
.filter-chip .remove:hover { opacity: 1; }
```

---

## 11. Navegación por Tabs

```css
.tabs { border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; gap: 4px; }
.tab {
  padding: 10px 20px;
  font-size: 14px; font-weight: 500;
  color: #546E7A;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  cursor: pointer;
}
.tab:hover { color: #B0BEC5; }
.tab.active {
  color: #4DC8E8;
  border-bottom-color: #4DC8E8;
  font-weight: 600;
}
```

---

## 12. Empty States y Pantallas Vacías

Cuando no hay datos que mostrar:

```
         [Ícono Lucide grande — 48px, color vs-gray-dark]
         
         No hay [entidades] aún
         [Descripción breve de qué significa y cómo agregar]
         
         [+ Agregar primer elemento]  ← btn-primary
```

- Centrado vertical y horizontal en el área de contenido
- Ícono con opacidad `0.5`
- Título: Montserrat 18px, `vs-gray-mid`
- Descripción: Inter 14px, `vs-gray-dark`, max-width `320px`

---

## 13. Checklist de Componente UI

Antes de entregar cualquier componente de interfaz:

- [ ] ¿Usa las capas de fondo correctas para Dark UI?
- [ ] ¿Los estados hover/active/focus están definidos?
- [ ] ¿Los badges de estado usan la paleta semántica?
- [ ] ¿Los gráficos usan la paleta `VS_CHART_COLORS`?
- [ ] ¿Las animaciones usan `transform`/`opacity` (no propiedades de reflow)?
- [ ] ¿Los inputs tienen estado de error definido?
- [ ] ¿El componente tiene empty state si puede quedar sin datos?
- [ ] ¿El skeleton loader está implementado para estados de carga?
- [ ] ¿Se respeta la jerarquía de capas (Capa 0 → 5)?
- [ ] ¿Los tooltips y overlays usan glassmorphism solo cuando corresponde?

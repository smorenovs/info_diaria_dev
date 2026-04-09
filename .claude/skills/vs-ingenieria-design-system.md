---
name: vs-ingenieria-design-system
description: >
  Sistema de diseño visual oficial para VS Ingeniería en Sistemas. Usar siempre
  que se genere cualquier interfaz de usuario, componente, página web, dashboard,
  documento, presentación, email, reporte o cualquier pieza visual relacionada con
  la marca VS Ingeniería en Sistemas. Incluye paleta de colores, tipografía,
  espaciado, componentes UI, estilo de código y lineamientos generales. Activar
  ante menciones de: "VS", "diseño", "interfaz", "componente", "frontend",
  "pantalla", "vista", "UI", "layout", "estilo", o cualquier solicitud de crear
  algo visual para el proyecto.
---

# VS Ingeniería en Sistemas — Design System

Guía de identidad visual y sistema de diseño para todos los entregables del proyecto. Aplicar de forma consistente en interfaces, documentos, presentaciones y cualquier pieza de comunicación visual.

---

## 1. Identidad de Marca

**Nombre completo:** VS Ingeniería en Sistemas  
**Sigla:** VS  
**Concepto visual:** Las iniciales "VS" forman un monograma donde la `V` evoca trazados de circuito impreso (líneas técnicas internas) y la `S` adopta una forma orgánica y fluida que sugiere dinamismo y adaptabilidad tecnológica. La combinación transmite precisión técnica + innovación.

---

## 2. Paleta de Colores

### Colores Primarios

| Nombre       | Hex       | RGB                  | Uso principal                          |
|--------------|-----------|----------------------|----------------------------------------|
| `vs-cyan`    | `#4DC8E8` | rgb(77, 200, 232)    | Acentos, íconos, highlights, CTA       |
| `vs-teal`    | `#2B8EA6` | rgb(43, 142, 166)    | Botones primarios, encabezados activos |
| `vs-deep`    | `#1F5F72` | rgb(31, 95, 114)     | Fondos de secciones, nav, sidebar      |
| `vs-navy`    | `#1A3D4F` | rgb(26, 61, 79)      | Fondo oscuro principal, texto sobre claro |

### Colores Secundarios / Neutros

| Nombre           | Hex       | Uso                                      |
|------------------|-----------|------------------------------------------|
| `vs-white`       | `#FFFFFF` | Fondos limpios, tarjetas, texto inverso  |
| `vs-gray-light`  | `#F4F7F9` | Fondo de página, superficies alternadas  |
| `vs-gray-mid`    | `#B0BEC5` | Bordes, separadores, texto secundario    |
| `vs-gray-dark`   | `#546E7A` | Texto terciario, placeholders            |
| `vs-text`        | `#1A3D4F` | Texto principal sobre fondo claro        |

### Gradientes de Marca

```css
/* Gradiente primario — íconos y elementos de marca */
--gradient-brand: linear-gradient(135deg, #4DC8E8 0%, #2B8EA6 50%, #1F5F72 100%);

/* Gradiente sutil — fondos de secciones destacadas */
--gradient-surface: linear-gradient(180deg, #F4F7F9 0%, #FFFFFF 100%);

/* Gradiente oscuro — hero, banners, headers */
--gradient-dark: linear-gradient(135deg, #1A3D4F 0%, #1F5F72 60%, #2B8EA6 100%);
```

### Uso Correcto del Color

- ✅ Texto `vs-text` (#1A3D4F) sobre `vs-white` o `vs-gray-light`  
- ✅ Texto blanco sobre `vs-deep`, `vs-navy` o gradiente oscuro  
- ✅ `vs-cyan` como acento sobre fondos oscuros  
- ❌ No usar `vs-cyan` como color de texto sobre fondo blanco (bajo contraste)  
- ❌ No combinar `vs-teal` con `vs-deep` en texto pequeño  

---

## 3. Tipografía

### Fuentes

| Rol              | Familia                   | Fallback               |
|------------------|---------------------------|------------------------|
| Títulos (H1–H2)  | **Montserrat**            | Arial, sans-serif      |
| Subtítulos (H3–H5)| **Montserrat**           | Arial, sans-serif      |
| Cuerpo / UI      | **Inter**                 | Segoe UI, sans-serif   |
| Código / Técnico | **JetBrains Mono**        | Fira Code, monospace   |

### Escala Tipográfica

```css
/* Títulos — Montserrat, peso 700–800 */
--text-h1: 2.5rem;     /* 40px — Título de página principal */
--text-h2: 2rem;       /* 32px — Sección principal */
--text-h3: 1.5rem;     /* 24px — Subsección */
--text-h4: 1.25rem;    /* 20px — Tarjeta / panel */
--text-h5: 1rem;       /* 16px — Etiquetas destacadas */

/* Cuerpo — Inter, peso 400–600 */
--text-body-lg: 1.125rem;  /* 18px — Texto introductorio */
--text-body:    1rem;      /* 16px — Párrafos estándar */
--text-body-sm: 0.875rem;  /* 14px — Texto secundario, notas */
--text-caption: 0.75rem;   /* 12px — Metadatos, timestamps */

/* Código — JetBrains Mono, peso 400–500 */
--text-code: 0.9rem;       /* 14.4px */
```

### Lineamientos Tipográficos

- Títulos siempre en **Montserrat Bold (700)** o **ExtraBold (800)**
- Tracking amplio en títulos: `letter-spacing: 0.02em` en H1/H2
- Texto en mayúsculas solo para etiquetas cortas (badges, labels) con `letter-spacing: 0.08em`
- Altura de línea: `1.6` para cuerpo, `1.2` para títulos
- Peso 600 (SemiBold) para énfasis dentro de texto corrido, nunca itálica aislada

---

## 4. Espaciado y Layout

```css
/* Escala de espaciado — base 4px */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-7:  48px;
--space-8:  64px;
--space-9:  96px;
--space-10: 128px;
```

### Grid y Contenedores

- **Grid base:** 12 columnas, gutter `24px`
- **Ancho máximo de contenido:** `1280px`
- **Padding lateral de página:** `24px` (mobile) / `48px` (tablet) / `64px` (desktop)
- **Breakpoints:**
  - Mobile: `< 640px`
  - Tablet: `640px – 1024px`
  - Desktop: `> 1024px`

---

## 5. Componentes UI

### Border Radius

```css
--radius-sm:   4px;   /* inputs pequeños, badges */
--radius-md:   8px;   /* tarjetas, botones */
--radius-lg:   16px;  /* modales, paneles destacados */
--radius-xl:   24px;  /* hero cards, banners */
--radius-full: 9999px; /* pills, avatares */
```

### Sombras

```css
--shadow-sm:  0 1px 3px rgba(26,61,79,0.10), 0 1px 2px rgba(26,61,79,0.06);
--shadow-md:  0 4px 12px rgba(26,61,79,0.12), 0 2px 4px rgba(26,61,79,0.08);
--shadow-lg:  0 10px 30px rgba(26,61,79,0.15), 0 4px 8px rgba(26,61,79,0.10);
--shadow-glow: 0 0 20px rgba(77,200,232,0.25); /* efecto neón suave para elementos activos */
```

### Botones

```css
/* Primario */
.btn-primary {
  background: var(--gradient-brand);
  color: #FFFFFF;
  font-family: Montserrat, sans-serif;
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 10px 24px;
  border: none;
  transition: opacity 0.2s, box-shadow 0.2s;
}
.btn-primary:hover { opacity: 0.90; box-shadow: var(--shadow-glow); }

/* Secundario */
.btn-secondary {
  background: transparent;
  color: var(--vs-teal);
  border: 2px solid var(--vs-teal);
  border-radius: var(--radius-md);
  padding: 10px 24px;
  font-weight: 600;
}
.btn-secondary:hover { background: var(--vs-teal); color: #FFFFFF; }

/* Ghost / Texto */
.btn-ghost {
  background: transparent;
  color: var(--vs-cyan);
  font-weight: 600;
  text-decoration: underline transparent;
  transition: text-decoration-color 0.2s;
}
.btn-ghost:hover { text-decoration-color: var(--vs-cyan); }
```

### Tarjetas (Cards)

```css
.card {
  background: var(--vs-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  border-left: 4px solid var(--vs-teal); /* línea de acento opcional */
}
.card-dark {
  background: var(--vs-deep);
  color: var(--vs-white);
  border-left: 4px solid var(--vs-cyan);
}
```

### Código y Bloques Técnicos

```css
code, pre {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-code);
  background: #0D2733;
  color: #4DC8E8;
  border-radius: var(--radius-sm);
  padding: 2px 6px;
}
pre {
  padding: var(--space-5);
  border-left: 3px solid var(--vs-cyan);
  overflow-x: auto;
  line-height: 1.6;
}
```

---

## 6. Iconografía

- **Librería recomendada:** [Lucide Icons](https://lucide.dev) (MIT, consistente con el estilo lineal de la marca)
- **Tamaños estándar:** `16px`, `20px`, `24px`, `32px`
- **Stroke width:** `1.5px` (predeterminado Lucide)
- **Color:** `vs-teal` en fondos claros / `vs-cyan` en fondos oscuros
- Los íconos nunca deben usarse solos en acciones críticas; siempre acompañados de texto o tooltip

---

## 7. Estilo Visual General

### Tono y Atmósfera

- **Profesional y técnico**, sin ser frío
- **Limpio y estructurado**: abundante espacio en blanco, jerarquía visual clara
- **Acento tecnológico**: uso sutil de gradientes, bordes brillantes (`vs-cyan`) en estado activo/hover
- Preferir interfaces **oscuras o semidarkness** para contextos técnicos (dashboards, IDEs, terminales)
- Preferir interfaces **claras** para documentación y portales públicos

### Patrones Prohibidos

- ❌ Colores de alerta estándar (rojo `#FF0000`, verde `#00FF00`) — usar variantes alineadas a la paleta
- ❌ Fuentes serif (Times New Roman, Georgia) — la marca es 100% sans-serif
- ❌ Degradados de colores no presentes en la paleta
- ❌ Bordes gruesos o sombras muy pronunciadas que compitan con el contenido
- ❌ Texto centrado en bloques largos (usar alineación izquierda para legibilidad)

---

## 8. Variables CSS Globales (Referencia Rápida)

```css
:root {
  /* Colores */
  --vs-cyan:        #4DC8E8;
  --vs-teal:        #2B8EA6;
  --vs-deep:        #1F5F72;
  --vs-navy:        #1A3D4F;
  --vs-white:       #FFFFFF;
  --vs-gray-light:  #F4F7F9;
  --vs-gray-mid:    #B0BEC5;
  --vs-gray-dark:   #546E7A;
  --vs-text:        #1A3D4F;

  /* Gradientes */
  --gradient-brand: linear-gradient(135deg, #4DC8E8 0%, #2B8EA6 50%, #1F5F72 100%);
  --gradient-dark:  linear-gradient(135deg, #1A3D4F 0%, #1F5F72 60%, #2B8EA6 100%);
  --gradient-surface: linear-gradient(180deg, #F4F7F9 0%, #FFFFFF 100%);

  /* Tipografía */
  --font-heading: 'Montserrat', Arial, sans-serif;
  --font-body:    'Inter', 'Segoe UI', sans-serif;
  --font-code:    'JetBrains Mono', 'Fira Code', monospace;

  /* Espaciado */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;
  --space-7: 48px;  --space-8: 64px;

  /* Radios */
  --radius-sm: 4px;   --radius-md: 8px;
  --radius-lg: 16px;  --radius-xl: 24px;  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm:   0 1px 3px rgba(26,61,79,0.10);
  --shadow-md:   0 4px 12px rgba(26,61,79,0.12);
  --shadow-lg:   0 10px 30px rgba(26,61,79,0.15);
  --shadow-glow: 0 0 20px rgba(77,200,232,0.25);
}
```

---

## 9. Tailwind Config (si se usa Tailwind CSS)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        vs: {
          cyan:       '#4DC8E8',
          teal:       '#2B8EA6',
          deep:       '#1F5F72',
          navy:       '#1A3D4F',
          'gray-light': '#F4F7F9',
          'gray-mid':   '#B0BEC5',
          'gray-dark':  '#546E7A',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'Arial', 'sans-serif'],
        body:    ['Inter', 'Segoe UI', 'sans-serif'],
        code:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'vs-sm': '4px', 'vs-md': '8px',
        'vs-lg': '16px', 'vs-xl': '24px',
      },
      boxShadow: {
        'vs-glow': '0 0 20px rgba(77,200,232,0.25)',
        'vs-md':   '0 4px 12px rgba(26,61,79,0.12)',
        'vs-lg':   '0 10px 30px rgba(26,61,79,0.15)',
      }
    }
  }
}
```

---

## 10. Checklist de Entregable Visual

Antes de entregar cualquier componente, pantalla o documento, verificar:

- [ ] ¿Se usaron únicamente colores de la paleta VS?
- [ ] ¿Los títulos están en Montserrat Bold/ExtraBold?
- [ ] ¿El cuerpo de texto usa Inter?
- [ ] ¿El contraste de texto cumple mínimo WCAG AA (4.5:1)?
- [ ] ¿El espaciado respeta la escala de 4px?
- [ ] ¿Los íconos son de Lucide y tienen el stroke correcto?
- [ ] ¿Los bordes redondeados siguen la escala definida?
- [ ] ¿El componente funciona en mobile (responsive)?
- [ ] ¿Se evitaron patrones prohibidos?

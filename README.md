# SuperAhorro S.A. - Sistema Integral de Supermercado

Sistema de información gerencial y operativo para la cadena de supermercados **SuperAhorro S.A.** Desarrollado con arquitectura moderna orientada a la nube, escalable, multisede (5 sucursales) y compatible con despliegue en Vercel y base de datos PostgreSQL mediante Supabase.

---

## 1. Tecnologías Implementadas

- **Frontend & Backend**: Next.js 16 (App Router) con React 19 y TypeScript.
- **Estilos e Interfaz**: Tailwind CSS v4 para diseño responsivo (computadoras, tablets y POS táctil).
- **Iconografía**: Lucide React.
- **Base de Datos Principal**: PostgreSQL en la nube a través de Supabase.
- **APIs de Negocio**: Next.js Route Handlers (`/api/products`, `/api/inventory`, `/api/pos`, `/api/reports`).
- **Capa de Resiliencia Híbrida**: Repositorio unificado que opera tanto con conexión activa a Supabase como con almacén persistente local para demostraciones académicas inmediatas.
- **Despliegue**: Optimizado para Vercel mediante Git y GitHub.

---

## 2. Módulos del Sistema

| Módulo | Descripción Funcional |
| :--- | :--- |
| **Dashboard Gerencial** | KPIs en tiempo real (ventas del día, ticket promedio, transacciones, alertas de stock crítico y lotes por vencer, gráfico semanal y por categoría). |
| **Punto de Venta (POS)** | Interfaz rápida de caja con lector de códigos de barras (EAN-13), cálculo automático de IVA (12% SAT), canje de puntos de fidelización, múltiples medios de pago (efectivo, tarjeta, etc.) y emisión de ticket con autorización FEL simulada. |
| **Catálogo de Productos** | Mantenimiento de productos con SKU, código de barras, categoría, marca, unidad de medida, costo, precio venta, precio mayoreo, clasificación de perecederos y stock mínimo/máximo. |
| **Inventario Multisede** | Control centralizado en 5 sucursales (Matriz Central, Norte, Sur, Este y Mixco Express). Traslados inter-sucursales y ajustes por merma. |
| **Kardex Transaccional** | Libro mayor cronológico de todos los movimientos (entradas por compra, salidas por venta, transferencias internas y ajustes de descarte). |
| **Lotes y Vencimientos** | Semáforo de proximidad de caducidad (&le; 15 días, &le; 30 días, vigentes y vencidos) y control de cadena de frío/perecederos. |
| **Compras y Recepción** | Emisión de órdenes de compra a proveedores y recepción de mercancía con ingreso automático a inventario y creación de lotes. |
| **Proveedores** | Directorio de distribuidores, NIT, contactos comerciales y plazos de crédito (15, 30, 45 días). |
| **Clientes y Fidelización** | Registro con NIT/DPI, programa de acumulación de puntos (1 punto por cada Q10.00 consumidos) y niveles del Club (Bronce, Plata, Oro, Diamante). |
| **Precios y Promociones** | Reglas de descuento dinámicas aplicadas automáticamente en caja por categoría o producto. |
| **Reportes y KPIs** | Reporte de recaudación, corte de caja, impuestos IVA, mermas y exportación directa a formato CSV. |
| **Usuarios y Roles (RBAC)** | Perfiles diferenciados: Administrador General, Gerente de Sucursal, Cajero, Encargado de Inventario y Comprador. Switcher en vivo para pruebas. |
| **Bitácora de Auditoría** | Registro inmutable de eventos con usuario, acción, módulo, payload JSON y dirección IP. |

---

## 3. Red de 5 Sucursales de SuperAhorro S.A.

1. **SUC-01 (Matriz Central)**: 6ta Avenida 12-34, Zona 1, Ciudad de Guatemala.
2. **SUC-02 (Sucursal Norte)**: Km 5.5 Carretera al Atlántico, Zona 17, Metronorte.
3. **SUC-03 (Sucursal Sur)**: Calzada Concepción 4-15, Zona 6, Villa Nueva.
4. **SUC-04 (Sucursal Este)**: Km 14.5 Carretera a El Salvador, Santa Catarina Pinula.
5. **SUC-05 (Sucursal Express Mixco)**: Bulevar San Cristóbal 8-90, Zona 8 de Mixco.

---

## 4. Instalación y Ejecución Local

### Requisitos Previos
- Node.js versión 18+ o superior (verificado con v24).
- npm versión 9+ o superior.

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd super-ahorro

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible inmediatamente en `http://localhost:3000`.

---

## 5. Configuración con Supabase (PostgreSQL en la Nube)

1. Ingresa a [https://supabase.com/](https://supabase.com/) y crea un nuevo proyecto PostgreSQL.
2. Ve al apartado **SQL Editor** en el panel de Supabase.
3. Ejecuta primero el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) para crear las tablas, relaciones, índices y políticas RLS.
4. Ejecuta a continuación el contenido de [`supabase/seed.sql`](./supabase/seed.sql) para poblar las 5 sucursales, productos, lotes y usuarios de muestra.
5. Copia la URL de tu proyecto y la Anon Public API Key desde **Project Settings > API**.
6. Pega estos valores en tu archivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```
7. Reinicia tu servidor local (`npm run dev`) o despliega a Vercel.

> **Nota de Resiliencia**: Si dejas las variables de entorno por defecto, el sistema activa automáticamente el **Motor de Persistencia Resiliente Local**, lo que permite evaluar el 100% de los flujos (crear productos, vender en POS, mover inventario, generar lotes y ver reportes) sin necesidad de internet ni credenciales externas.

---

## 6. Guía de Despliegue en Vercel mediante GitHub

1. Inicializa y sube tu código a GitHub:
   ```bash
   git add .
   git commit -m "feat: Sistema Integral SuperAhorro S.A."
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/super-ahorro.git
   git push -u origin main
   ```
2. Inicia sesión en [Vercel](https://vercel.com/) con tu cuenta de GitHub.
3. Haz clic en **Add New Project** y selecciona el repositorio `super-ahorro`.
4. En **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_NAME`: `SuperAhorro S.A.`
   - `NEXT_PUBLIC_CURRENCY_SYMBOL`: `Q`
   - `NEXT_PUBLIC_DEFAULT_IVA`: `12`
5. Haz clic en **Deploy**. Vercel compilará automáticamente el proyecto y te entregará una URL de producción (HTTPS).

---

## 7. Verificación de Compilación de Producción

Para validar la compilación antes de publicar:
```bash
npm run build
```
Resultado: **Compilación limpia con Turbopack exitosa (Exit code 0)**.

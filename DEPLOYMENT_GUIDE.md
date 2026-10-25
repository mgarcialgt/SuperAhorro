# Guía de Despliegue: Supabase, GitHub y Vercel
## Proyecto: Sistema Integral de Supermercado SuperAhorro S.A.

Esta guía detalla el proceso completo para poner en producción el sistema utilizando la infraestructura en la nube de **Supabase (PostgreSQL)** y **Vercel (Next.js)** con control de versiones en **GitHub**.

---

## FASE 1: Configurar Supabase (Base de Datos PostgreSQL)

### 1.1 Crear Proyecto en Supabase
1. Ingresa a [https://supabase.com/](https://supabase.com/) e inicia sesión con tu cuenta (puedes usar tu cuenta de GitHub).
2. Haz clic en el botón verde **"New Project"**.
3. Completa los campos:
   - **Name**: `super-ahorro` (o el nombre de tu preferencia).
   - **Database Password**: Genera una contraseña segura y guárdala.
   - **Region**: Selecciona una región cercana (por ejemplo: `East US (North Virginia)`).
   - **Pricing Plan**: `Free Plan` (suficiente para el prototipo y evaluación).
4. Haz clic en **"Create new project"** y espera de 1 a 2 minutos mientras Supabase aprovisiona el clúster de PostgreSQL.

### 1.2 Ejecutar los Scripts SQL de Esquema y Datos
1. En el menú lateral izquierdo de Supabase, haz clic en el icono de **SQL Editor** (icono con `>_`).
2. Haz clic en **"New query"**.
3. Abre el archivo de tu proyecto local: [`supabase/schema.sql`](./supabase/schema.sql).
4. Copia todo su contenido, pégalo en el editor de Supabase y haz clic en el botón **"Run"** (o presiona `Ctrl + Enter`).
   - *Resultado esperado*: `Success. No rows returned`. Se habrán creado las tablas (`sucursales`, `productos`, `inventario_sucursal`, `lotes`, `ventas`, `clientes`, etc.), índices, enums y políticas RLS.
5. Abre una nueva pestaña de consulta (**"New query"**).
6. Abre el archivo local: [`supabase/seed.sql`](./supabase/seed.sql).
7. Copia todo su contenido, pégalo en el editor y haz clic en **"Run"**.
   - *Resultado esperado*: Se insertarán las 5 sucursales, categorías, marcas, catálogo de productos, lotes con vencimientos, clientes con puntos de fidelidad y usuarios de los distintos roles.

### 1.3 Obtener Credenciales de Conexión
1. En el menú lateral izquierdo de Supabase, ve a **Project Settings** (icono de engranaje abajo a la izquierda).
2. Selecciona la opción **Data API** (o **API** en versiones anteriores).
3. Localiza la sección **API Settings**:
   - **Project URL**: Ejemplo: `https://abcdefghijklm.supabase.co`
   - **Project API keys**: Copia la clave identificada como `anon` `public`.
4. En tu proyecto local, abre el archivo `.env.local` y reemplaza los valores de demostración por los reales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica_aqui
   ```

---

## FASE 2: Subir el Código a GitHub

El proyecto ya cuenta con Git inicializado y un commit limpio con todos los módulos. Sigue estos pasos para vincularlo a tu cuenta de GitHub:

### 2.1 Crear Repositorio en GitHub
1. Ingresa a [https://github.com/new](https://github.com/new).
2. En **Repository name**, escribe: `super-ahorro`.
3. Selecciona **Public** (o **Private** según tu preferencia).
4. **IMPORTANTE**: No marques las casillas de "Add a README file", ".gitignore" o "license", ya que tu proyecto local ya los incluye.
5. Haz clic en **"Create repository"**.

### 2.2 Conectar el Repositorio Local y Subir el Código
Abre tu terminal en la carpeta del proyecto (`c:\xampp\htdocs\super-ahorro`) y ejecuta:

```powershell
# 1. Asegurar que la rama principal se llame main
git branch -M main

# 2. Agregar la URL remota de tu repositorio de GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/<TU_USUARIO_GITHUB>/super-ahorro.git

# 3. Subir el código a GitHub
git push -u origin main
```

*(Si GitHub te solicita autenticación en Windows, se abrirá una ventana para iniciar sesión con tu navegador o token personal).*

---

## FASE 3: Desplegar en Vercel

### 3.1 Conectar Vercel con GitHub
1. Ingresa a [https://vercel.com/](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. En tu Dashboard principal de Vercel, haz clic en el botón **"Add New..."** y selecciona **"Project"**.
3. En la lista de repositorios de GitHub, busca `super-ahorro` y haz clic en **"Import"**.

### 3.2 Configurar el Proyecto y Variables de Entorno
1. En la pantalla de configuración:
   - **Framework Preset**: Vercel detectará automáticamente `Next.js`.
   - **Root Directory**: `./` (por defecto).
2. Despliega la sección **"Environment Variables"** y añade las siguientes 5 variables:

| Nombre de la Variable | Valor |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<tu-id-proyecto>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Tu clave anon pública copiada de Supabase)* |
| `NEXT_PUBLIC_APP_NAME` | `SuperAhorro S.A.` |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | `Q` |
| `NEXT_PUBLIC_DEFAULT_IVA` | `12` |

3. Haz clic en el botón azul **"Deploy"**.

### 3.3 Esperar la Compilación y Lanzamiento
- Vercel clonará el repositorio, instalará las dependencias y compilará la aplicación con Turbopack (toma aproximadamente 1 a 2 minutos).
- Al finalizar, verás una pantalla de felicitaciones con confeti y el enlace público de tu aplicación (por ejemplo: `https://super-ahorro.vercel.app` o similar).

---

## FASE 4: Verificación Funcional Post-Despliegue

Una vez en tu URL de producción en Vercel:

1. **Indicador de Base de Datos**:
   - En la parte inferior de la barra lateral (Sidebar), verifica que el indicador señale:
     `🟢 Base de Datos: PostgreSQL Supabase`.
2. **Prueba de Transacción POS**:
   - Ve al módulo **Punto de Venta (POS)**.
   - Selecciona productos, un cliente y presiona **"Proceder al Cobro"**.
   - Completa el pago en efectivo o tarjeta.
   - Verifica la emisión del ticket con la autorización FEL simulada.
3. **Comprobación en Supabase**:
   - En la consola de Supabase, ve a **Table Editor > ventas** e **inventario_sucursal**.
   - Verás tu nueva venta registrada en la base de datos PostgreSQL con el descuento de existencias aplicado.
4. **Prueba de Multisede**:
   - En la barra superior, cambia entre las 5 sucursales (Central, Norte, Sur, Este, Mixco) y observa cómo el inventario y las ventas se filtran por sede en tiempo real.

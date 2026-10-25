-- ==============================================================================
-- SISTEMA INTEGRAL DE SUPERMERCADO SUPERAHORRO S.A.
-- Esquema de Base de Datos PostgreSQL / Supabase
-- ==============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('admin', 'gerente_sucursal', 'cajero', 'encargado_inventario', 'encargado_compras');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_movimiento_stock AS ENUM (
        'entrada_compra', 
        'salida_venta', 
        'transferencia_salida', 
        'transferencia_entrada', 
        'ajuste_positivo', 
        'ajuste_merma'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_orden_compra AS ENUM ('borrador', 'solicitada', 'aprobada', 'recibida', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago AS ENUM ('efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'puntos_fidelidad', 'mixto');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_promocion AS ENUM ('porcentaje', 'monto_fijo', 'dos_por_uno', 'combo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_lote AS ENUM ('vigente', 'por_vencer', 'vencido', 'agotado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nivel_fidelizacion AS ENUM ('Bronce', 'Plata', 'Oro', 'Diamante');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLAS PRINCIPALES

-- 2.1 Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) DEFAULT 'Guatemala',
    telefono VARCHAR(30),
    email VARCHAR(100),
    es_matriz BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Categorías de Productos
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'Package',
    color_badge VARCHAR(30) DEFAULT 'emerald',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Marcas
CREATE TABLE IF NOT EXISTS marcas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    pais_origen VARCHAR(50) DEFAULT 'Guatemala',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Catálogo Central de Productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(60) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    unidad_medida VARCHAR(30) DEFAULT 'Unidad',
    costo_promedio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    precio_venta NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    precio_mayoreo NUMERIC(12, 2) DEFAULT 0.00,
    iva_porcentaje NUMERIC(5, 2) DEFAULT 12.00,
    stock_minimo INTEGER DEFAULT 10,
    stock_maximo INTEGER DEFAULT 500,
    es_perecedero BOOLEAN DEFAULT false,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Lotes y Control de Vencimientos
CREATE TABLE IF NOT EXISTS lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    numero_lote VARCHAR(80) NOT NULL,
    fecha_fabricacion DATE,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INTEGER NOT NULL,
    cantidad_disponible INTEGER NOT NULL,
    costo_compra NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estado estado_lote DEFAULT 'vigente',
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Inventario por Sucursal
CREATE TABLE IF NOT EXISTS inventario_sucursal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_reservado INTEGER DEFAULT 0,
    stock_minimo_local INTEGER DEFAULT 10,
    pasillo_ubicacion VARCHAR(50) DEFAULT 'Góndola General',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_producto_sucursal UNIQUE (producto_id, sucursal_id)
);

-- 2.7 Movimientos de Stock (Kardex Transaccional)
CREATE TABLE IF NOT EXISTS movimientos_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_movimiento tipo_movimiento_stock NOT NULL,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    sucursal_origen_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    sucursal_destino_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL,
    costo_unitario NUMERIC(12, 2) DEFAULT 0.00,
    referencia_tipo VARCHAR(50),
    referencia_id VARCHAR(100),
    motivo TEXT,
    usuario_id UUID,
    usuario_nombre VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Clientes y Fidelización
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento VARCHAR(20) DEFAULT 'NIT',
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    puntos_acumulados INTEGER DEFAULT 0,
    nivel_fidelizacion nivel_fidelizacion DEFAULT 'Bronce',
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nit VARCHAR(30) UNIQUE NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    nombre_comercial VARCHAR(150),
    contacto_nombre VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(30),
    direccion VARCHAR(255),
    dias_credito INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id UUID NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
    sucursal_destino_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE RESTRICT,
    estado estado_orden_compra DEFAULT 'borrador',
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_esperada DATE,
    fecha_recepcion TIMESTAMPTZ,
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    iva NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) DEFAULT 0.00,
    notas TEXT,
    creado_por VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 Detalle de Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad_solicitada INTEGER NOT NULL,
    cantidad_recibida INTEGER DEFAULT 0,
    costo_unitario NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    numero_lote VARCHAR(80),
    fecha_vencimiento DATE
);

-- 2.12 Cajas POS
CREATE TABLE IF NOT EXISTS cajas_pos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    codigo_caja VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'cerrada',
    monto_fondo_base NUMERIC(10, 2) DEFAULT 500.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_caja_sucursal UNIQUE (sucursal_id, codigo_caja)
);

-- 2.13 Sesiones / Turnos de Caja
CREATE TABLE IF NOT EXISTS turnos_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caja_id UUID NOT NULL REFERENCES cajas_pos(id) ON DELETE CASCADE,
    cajero_id UUID,
    cajero_nombre VARCHAR(100) NOT NULL,
    fecha_apertura TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    monto_inicial NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
    monto_ventas_efectivo NUMERIC(12, 2) DEFAULT 0.00,
    monto_ventas_tarjeta NUMERIC(12, 2) DEFAULT 0.00,
    monto_total_sistema NUMERIC(12, 2) DEFAULT 0.00,
    monto_cierre_declarado NUMERIC(12, 2),
    diferencia NUMERIC(12, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'abierto',
    observaciones TEXT
);

-- 2.14 Ventas / Facturación POS
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serie_factura VARCHAR(20) NOT NULL DEFAULT 'FEL-A',
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE RESTRICT,
    caja_id UUID REFERENCES cajas_pos(id) ON DELETE SET NULL,
    turno_id UUID REFERENCES turnos_caja(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nombre VARCHAR(150) DEFAULT 'Consumidor Final',
    cliente_nit VARCHAR(50) DEFAULT 'CF',
    cajero_nombre VARCHAR(100) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    descuento NUMERIC(12, 2) DEFAULT 0.00,
    iva NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    metodo_pago metodo_pago DEFAULT 'efectivo',
    monto_recibido NUMERIC(12, 2) DEFAULT 0.00,
    cambio NUMERIC(12, 2) DEFAULT 0.00,
    puntos_otorgados INTEGER DEFAULT 0,
    puntos_canjeados INTEGER DEFAULT 0,
    descuento_puntos NUMERIC(10, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'completada',
    autorizacion_fel VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.15 Detalle de Ventas
CREATE TABLE IF NOT EXISTS ventas_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    producto_nombre VARCHAR(200) NOT NULL,
    producto_sku VARCHAR(50) NOT NULL,
    lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(12, 2) NOT NULL,
    descuento NUMERIC(12, 2) DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL,
    iva NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- 2.16 Promociones y Descuentos
CREATE TABLE IF NOT EXISTS promociones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(120) NOT NULL,
    descripcion TEXT,
    tipo tipo_promocion DEFAULT 'porcentaje',
    valor_descuento NUMERIC(10, 2) NOT NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.17 Usuarios y Roles
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol rol_usuario DEFAULT 'cajero',
    sucursal_asignada_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    telefono VARCHAR(30),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.18 Bitácora de Auditoría
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID,
    usuario_nombre VARCHAR(100) NOT NULL,
    accion VARCHAR(80) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(100),
    detalles_json JSONB,
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    ip_origen VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_productos_barcode ON productos(barcode);
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_inventario_sucursal ON inventario_sucursal(sucursal_id, producto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_sucursal ON lotes(producto_id, sucursal_id);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal_fecha ON ventas(sucursal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_factura ON ventas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_stock(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_logs(created_at DESC);

-- 4. SEGURIDAD Y POLÍTICAS RLS
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_sucursal ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON sucursales FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON productos FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON inventario_sucursal FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON lotes FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON ventas FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON ventas_detalle FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON clientes FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON proveedores FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON ordenes_compra FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON movimientos_stock FOR ALL USING (true);';
    EXECUTE 'CREATE POLICY "Permitir todo a anon y auth para desarrollo" ON auditoria_logs FOR ALL USING (true);';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- SISTEMA INTEGRAL DE SUPERMERCADO SUPERAHORRO S.A.
-- Datos Semilla (Seed Data) para PostgreSQL / Supabase
-- ==============================================================================

-- 1. SUCURSALES (5 Sucursales de SuperAhorro S.A.)
INSERT INTO sucursales (id, codigo, nombre, direccion, municipio, departamento, telefono, email, es_matriz, activo) VALUES
('a0000000-0000-0000-0000-000000000001', 'SUC-01', 'SuperAhorro Matriz Central', '6ta Avenida 12-34, Zona 1', 'Guatemala', 'Guatemala', '+502 2234-5601', 'central@superahorro.com.gt', true, true),
('a0000000-0000-0000-0000-000000000002', 'SUC-02', 'SuperAhorro Norte Metronorte', 'Km 5.5 Carretera al Atlántico, Zona 17', 'Guatemala', 'Guatemala', '+502 2234-5602', 'norte@superahorro.com.gt', false, true),
('a0000000-0000-0000-0000-000000000003', 'SUC-03', 'SuperAhorro Sur Villa Nueva', 'Calzada Concepción 4-15, Zona 6', 'Villa Nueva', 'Guatemala', '+502 2234-5603', 'sur@superahorro.com.gt', false, true),
('a0000000-0000-0000-0000-000000000004', 'SUC-04', 'SuperAhorro Este Carretera', 'Km 14.5 Carretera a El Salvador', 'Santa Catarina Pinula', 'Guatemala', '+502 2234-5604', 'este@superahorro.com.gt', false, true),
('a0000000-0000-0000-0000-000000000005', 'SUC-05', 'SuperAhorro Express Mixco', 'Bulevar San Cristóbal 8-90, Zona 8', 'Mixco', 'Guatemala', '+502 2234-5605', 'mixco@superahorro.com.gt', false, true)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORÍAS
INSERT INTO categorias (id, nombre, descripcion, icono, color_badge) VALUES
('b0000000-0000-0000-0000-000000000001', 'Lácteos y Huevos', 'Leche, quesos, yogures, mantequillas y huevos frescos', 'Milk', 'blue'),
('b0000000-0000-0000-0000-000000000002', 'Abarrotes y Despensa', 'Granos, harinas, pastas, enlatados y aceites', 'Wheat', 'amber'),
('b0000000-0000-0000-0000-000000000003', 'Carnes y Aves', 'Cortes de res, cerdo, pollo fresco y embutidos', 'Beef', 'rose'),
('b0000000-0000-0000-0000-000000000004', 'Frutas y Verduras', 'Productos agrícolas frescos cosechados del día', 'Apple', 'emerald'),
('b0000000-0000-0000-0000-000000000005', 'Panadería y Pastelería', 'Pan fresco tradicional, bollería y galletas', 'Croissant', 'orange'),
('b0000000-0000-0000-0000-000000000006', 'Bebidas y Refrescos', 'Jugos, sodas, agua purificada, néctares y té', 'CupSoda', 'cyan'),
('b0000000-0000-0000-0000-000000000007', 'Cuidado y Aseo Personal', 'Jabones, champús, cremas dentales y desodorantes', 'Sparkles', 'purple'),
('b0000000-0000-0000-0000-000000000008', 'Limpieza del Hogar', 'Detergentes, desinfectantes, papel higiénico y suavizantes', 'Home', 'teal')
ON CONFLICT (id) DO NOTHING;

-- 3. MARCAS
INSERT INTO marcas (id, nombre, pais_origen) VALUES
('c0000000-0000-0000-0000-000000000001', 'SuperAhorro Selection', 'Guatemala'),
('c0000000-0000-0000-0000-000000000002', 'Trebolac', 'Guatemala'),
('c0000000-0000-0000-0000-000000000003', 'Toledo Embutidos', 'Guatemala'),
('c0000000-0000-0000-0000-000000000004', 'Ina Pastas', 'Guatemala'),
('c0000000-0000-0000-0000-000000000005', 'Coca-Cola', 'Estados Unidos'),
('c0000000-0000-0000-0000-000000000006', 'Colgate-Palmolive', 'Estados Unidos'),
('c0000000-0000-0000-0000-000000000007', 'Bimbo', 'México'),
('c0000000-0000-0000-0000-000000000008', 'Nestlé', 'Suiza')
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTOS DESTACADOS
INSERT INTO productos (id, sku, barcode, nombre, descripcion, categoria_id, marca_id, unidad_medida, costo_promedio, precio_venta, precio_mayoreo, iva_porcentaje, stock_minimo, stock_maximo, es_perecedero) VALUES
('d0000000-0000-0000-0000-000000000001', 'SKU-LAC-001', '7401001001011', 'Leche Entera Trebolac 1 Litro Tetra Pak', 'Leche de vaca ultra pasteurizada enriquecida con vitaminas A y D', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Litro', 10.50, 14.50, 13.50, 12.00, 25, 400, true),
('d0000000-0000-0000-0000-000000000002', 'SKU-LAC-002', '7401001001028', 'Queso Crema Trebolac 227g', 'Queso crema para untar, suave y cremoso', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Unidad', 12.00, 17.25, 16.00, 12.00, 15, 200, true),
('d0000000-0000-0000-0000-000000000003', 'SKU-LAC-003', '7401001001035', 'Cartón de Huevos Blancos Granja 30 Unidades', 'Huevos frescos de gallina clasificados tamaño grande', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Paquete', 34.00, 44.50, 42.00, 12.00, 20, 300, true),
('d0000000-0000-0000-0000-000000000004', 'SKU-ABA-001', '7401001002018', 'Arroz Blanco SuperAhorro Especial 2 Libras', 'Arroz grano entero seleccionado calidad premium', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Paquete', 8.20, 11.50, 10.25, 12.00, 40, 600, false),
('d0000000-0000-0000-0000-000000000005', 'SKU-ABA-002', '7401001002025', 'Frijol Negro de Primera SuperAhorro 2 Libras', 'Frijol nuevo de rápida cocción cosechado en Petén', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Paquete', 10.50, 14.75, 13.50, 12.00, 35, 500, false),
('d0000000-0000-0000-0000-000000000006', 'SKU-ABA-003', '7401001002032', 'Aceite Vegetal Cocinero 800ml', 'Aceite 100% puro de soya libre de grasas trans', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Unidad', 13.50, 18.00, 17.00, 12.00, 25, 350, false),
('d0000000-0000-0000-0000-000000000007', 'SKU-ABA-004', '7401001002049', 'Espagueti Ina Clásico 200g', 'Pasta de trigo fortificada con hierro y ácido fólico', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', 'Paquete', 3.20, 4.75, 4.25, 12.00, 50, 800, false),
('d0000000-0000-0000-0000-000000000008', 'SKU-CAR-001', '7401001003015', 'Pechuga de Pollo Fresca Bandeja 1 Libra', 'Pechuga desgrasada sin piel, lista para cocinar', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Kg', 18.00, 25.50, 24.00, 12.00, 15, 150, true),
('d0000000-0000-0000-0000-000000000009', 'SKU-CAR-002', '7401001003022', 'Salchicha Toledo Tradicional 454g', 'Paquete de 8 salchichas de cerdo y ave ahumadas', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Paquete', 14.00, 19.90, 18.50, 12.00, 20, 200, true),
('d0000000-0000-0000-0000-000000000010', 'SKU-BEB-001', '7401001004012', 'Coca-Cola Original 2.5 Litros PET', 'Refresco de cola carbonatada retornable/descartable familiar', 'b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000005', 'Unidad', 15.00, 20.00, 19.00, 12.00, 30, 400, false),
('d0000000-0000-0000-0000-000000000011', 'SKU-PAN-001', '7401001005019', 'Pan Blanco Bimbo Grande 680g', 'Pan de molde suave enriquecido con calcio y vitaminas', 'b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000007', 'Unidad', 16.50, 22.50, 21.00, 12.00, 15, 120, true),
('d0000000-0000-0000-0000-000000000012', 'SKU-ASE-001', '7401001006016', 'Pasta Dental Colgate Triple Acción 100ml', 'Protección anticaries, blanqueamiento y frescura prolongada', 'b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'Unidad', 11.20, 16.00, 14.50, 12.00, 20, 250, false),
('d0000000-0000-0000-0000-000000000013', 'SKU-LIM-001', '7401001007013', 'Detergente en Polvo Floral SuperAhorro 2.5 Kg', 'Detergente multiusos con micro cápsulas de perfume', 'b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', 'Unidad', 24.50, 35.00, 32.00, 12.00, 15, 180, false),
('d0000000-0000-0000-0000-000000000014', 'SKU-FRU-001', '7401001008010', 'Manzana Gala Importada 1 Libra', 'Manzana roja crujiente, dulce y aromática', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Kg', 12.00, 16.50, 15.00, 12.00, 15, 150, true),
('d0000000-0000-0000-0000-000000000015', 'SKU-FRU-002', '7401001008027', 'Plátano Maduro Selección Malla 5 Unidades', 'Plátano dulce para freír o postres típicos', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Paquete', 7.00, 10.00, 9.00, 12.00, 10, 100, true)
ON CONFLICT (id) DO NOTHING;

-- 5. LOTES DE PRODUCTOS (Incluyendo algunos por vencer para pruebas de alerta)
INSERT INTO lotes (id, producto_id, sucursal_id, numero_lote, fecha_fabricacion, fecha_vencimiento, cantidad_inicial, cantidad_disponible, costo_compra, estado, notas) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LOT-LECHE-2026-A1', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '8 days', 100, 48, 10.50, 'por_vencer', 'Próximo a expirar en 8 días - Promoción sugerida'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'LOT-LECHE-2026-B2', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '45 days', 150, 150, 10.50, 'vigente', 'Lote fresco recién recibido'),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'LOT-POLLO-2026-09', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '4 days', 50, 22, 18.00, 'por_vencer', 'Cadena de frío verificada 2°C'),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002', 'LOT-SALCH-2026-01', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '25 days', 80, 65, 14.00, 'vigente', 'Empaque al vacío íntegro')
ON CONFLICT (id) DO NOTHING;

-- 6. INVENTARIO DISTRIBUIDO EN LAS 5 SUCURSALES
-- Matriz Central (Sucursal 1)
INSERT INTO inventario_sucursal (producto_id, sucursal_id, stock_actual, stock_minimo_local, pasillo_ubicacion) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 198, 30, 'Refrigeradores - Pasillo 2'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 84, 15, 'Refrigeradores - Pasillo 2'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 115, 20, 'Góndola 1 - Abarrotes'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 340, 50, 'Góndola 3 - Granos'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 280, 40, 'Góndola 3 - Granos'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 160, 25, 'Góndola 4 - Aceites'),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 410, 50, 'Góndola 4 - Pastas'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 45, 20, 'Carnicería - Nevera 1'),
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 95, 20, 'Embutidos - Nevera 2'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 220, 30, 'Bebidas - Pasillo 7'),
('d0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 60, 15, 'Panadería Stand A'),
('d0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 130, 20, 'Higiene - Pasillo 8'),
('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 90, 15, 'Limpieza - Pasillo 9'),
('d0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 75, 15, 'Frutería Isla 1'),
('d0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 50, 10, 'Frutería Isla 2'),

-- Sucursal Norte (Sucursal 2)
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 85, 20, 'Lácteos Norte'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 150, 30, 'Góndola 2'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 95, 25, 'Bebidas Norte'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 8, 15, 'Carnicería Norte - STOCK BAJO'), -- Stock bajo para alerta

-- Sucursal Sur (Sucursal 3)
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 110, 20, 'Lácteos Sur'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 70, 20, 'Góndola 4 Sur'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 140, 25, 'Bebidas Sur'),

-- Sucursal Este (Sucursal 4)
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 90, 20, 'Lácteos Este'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 120, 25, 'Granos Este'),
('d0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004', 45, 15, 'Limpieza Este'),

-- Sucursal Express Mixco (Sucursal 5)
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 40, 15, 'Refrigerador Express'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 60, 20, 'Estante Central'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000005', 75, 15, 'Enfriador Entrada')
ON CONFLICT (producto_id, sucursal_id) DO UPDATE 
SET stock_actual = EXCLUDED.stock_actual;

-- 7. CLIENTES Y PROGRAMA DE FIDELIZACIÓN
INSERT INTO clientes (id, tipo_documento, numero_documento, nombre_completo, email, telefono, direccion, puntos_acumulados, nivel_fidelizacion) VALUES
('f0000000-0000-0000-0000-000000000001', 'NIT', 'CF', 'Consumidor Final', 'ventas@superahorro.com.gt', '+502 2200-0000', 'Ciudad de Guatemala', 0, 'Bronce'),
('f0000000-0000-0000-0000-000000000002', 'NIT', '4589231-8', 'Licda. Sofia Alejandra Reyes', 'sofia.reyes@gmail.com', '+502 5512-3489', 'Zona 14, La Cañada', 450, 'Oro'),
('f0000000-0000-0000-0000-000000000003', 'NIT', '7892341-2', 'Ing. Carlos Roberto Mendoza', 'carlos.mendoza@corporativo.gt', '+502 5988-1243', 'Zona 10, Oakland', 820, 'Diamante'),
('f0000000-0000-0000-0000-000000000004', 'NIT', '1245890-4', 'Dra. Elena Vasquez Monroy', 'elena.vasquez@salud.gob.gt', '+502 4432-8711', 'Zona 11, Miraflores', 210, 'Plata'),
('f0000000-0000-0000-0000-000000000005', 'DPI', '2489123450101', 'Mario Rene Morales Perez', 'mario.morales@outlook.com', '+502 3310-9944', 'San Cristóbal, Mixco', 65, 'Bronce')
ON CONFLICT (id) DO NOTHING;

-- 8. PROVEEDORES
INSERT INTO proveedores (id, nit, razon_social, nombre_comercial, contacto_nombre, email, telefono, dias_credito) VALUES
('10000000-0000-0000-0000-000000000001', '3344556-7', 'Lácteos Trebolac S.A.', 'Trebolac Distribución', 'Lic. Fernando Prado', 'pedidos@trebolac.com.gt', '+502 2450-8900', 30),
('10000000-0000-0000-0000-000000000002', '8899123-1', 'Granja Toledo Alimentos S.A.', 'Embutidos Toledo', 'Inga. Claudia Mendez', 'ventas@toledo.com.gt', '+502 2380-4500', 15),
('10000000-0000-0000-0000-000000000003', '1234567-8', 'Corporación Multi Inversiones S.A.', 'Pastas INA & Harinas', 'Rodrigo Barillas', 'rbarillas@cmi.co', '+502 2410-0000', 45),
('10000000-0000-0000-0000-000000000004', '9988776-5', 'Distribuidora del Caribe S.A.', 'Bebidas Coca-Cola & Jugos', 'Marco Antonio Solis', 'logistica@femsa.com.gt', '+502 2290-7000', 30)
ON CONFLICT (id) DO NOTHING;

-- 9. CAJAS POS
INSERT INTO cajas_pos (id, sucursal_id, codigo_caja, nombre, estado, monto_fondo_base) VALUES
('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'POS-01', 'Caja 01 - Rápida (Matriz)', 'abierta', 500.00),
('20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'POS-02', 'Caja 02 - Carretas Llenas', 'cerrada', 500.00),
('20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'POS-01', 'Caja 01 - Norte', 'abierta', 500.00),
('20000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'POS-01', 'Caja 01 - Sur', 'cerrada', 500.00),
('20000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'POS-01', 'Caja 01 - Este', 'abierta', 500.00),
('20000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'POS-01', 'Caja 01 - Mixco Express', 'abierta', 500.00)
ON CONFLICT (id) DO NOTHING;

-- 10. USUARIOS DEL SISTEMA Y ROLES
INSERT INTO usuarios (id, email, nombre_completo, rol, sucursal_asignada_id, telefono) VALUES
('30000000-0000-0000-0000-000000000001', 'admin@superahorro.com.gt', 'Lic. Alejandro Morales (Administrador General)', 'admin', 'a0000000-0000-0000-0000-000000000001', '+502 5555-0100'),
('30000000-0000-0000-0000-000000000002', 'gerente.norte@superahorro.com.gt', 'Karla Patricia Estrada (Gerente Sucursal Norte)', 'gerente_sucursal', 'a0000000-0000-0000-0000-000000000002', '+502 5555-0200'),
('30000000-0000-0000-0000-000000000003', 'cajero.central@superahorro.com.gt', 'Edwin Josué Lopez (Cajero Principal)', 'cajero', 'a0000000-0000-0000-0000-000000000001', '+502 5555-0300'),
('30000000-0000-0000-0000-000000000004', 'bodega@superahorro.com.gt', 'Manuel Antonio Rivas (Encargado de Inventario y Lotes)', 'encargado_inventario', 'a0000000-0000-0000-0000-000000000001', '+502 5555-0400'),
('30000000-0000-0000-0000-000000000005', 'compras@superahorro.com.gt', 'Brenda Elizabeth Castillo (Jefa de Compras & Proveedores)', 'encargado_compras', 'a0000000-0000-0000-0000-000000000001', '+502 5555-0500')
ON CONFLICT (id) DO NOTHING;

-- 11. PROMOCIONES ACTIVAS
INSERT INTO promociones (id, titulo, descripcion, tipo, valor_descuento, categoria_id, fecha_inicio, fecha_fin, activo) VALUES
('40000000-0000-0000-0000-000000000001', 'Festival de Lácteos Frescos', '15% de descuento directo en toda la línea de leches y quesos Trebolac', 'porcentaje', 15.00, 'b0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', true),
('40000000-0000-0000-0000-000000000002', 'Ahorro en Despensa Básica', '10% de descuento en granos y pastas SuperAhorro e Ina', 'porcentaje', 10.00, 'b0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '15 days', true)
ON CONFLICT (id) DO NOTHING;

-- 12. VENTAS DEMOSTRATIVAS PREVIAS (Para alimentar KPIs)
INSERT INTO ventas (id, serie_factura, numero_factura, sucursal_id, cliente_id, cliente_nombre, cliente_nit, cajero_nombre, subtotal, descuento, iva, total, metodo_pago, monto_recibido, cambio, puntos_otorgados, estado, autorizacion_fel, created_at) VALUES
('50000000-0000-0000-0000-000000000001', 'FEL-A', 'FAC-2026-000142', 'a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'Licda. Sofia Alejandra Reyes', '4589231-8', 'Edwin Josué Lopez', 145.50, 14.50, 15.59, 131.00, 'tarjeta_credito', 131.00, 0.00, 13, 'completada', 'F8D9A2-E341-4321-9988-771234901234', NOW() - INTERVAL '3 hours'),
('50000000-0000-0000-0000-000000000002', 'FEL-A', 'FAC-2026-000143', 'a0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Consumidor Final', 'CF', 'Edwin Josué Lopez', 74.50, 0.00, 7.98, 74.50, 'efectivo', 100.00, 25.50, 0, 'completada', 'C118B4-9021-4889-AA12-990011223344', NOW() - INTERVAL '1 hour 20 minutes'),
('50000000-0000-0000-0000-000000000003', 'FEL-A', 'FAC-2026-000144', 'a0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000003', 'Ing. Carlos Roberto Mendoza', '7892341-2', 'Karla Patricia Estrada', 285.00, 25.00, 30.54, 260.00, 'tarjeta_debito', 260.00, 0.00, 26, 'completada', 'AA7711-BB22-4455-CC66-889900112233', NOW() - INTERVAL '40 minutes')
ON CONFLICT (id) DO NOTHING;

-- 13. MOVIMIENTOS KARDEX INICIALES
INSERT INTO movimientos_stock (tipo_movimiento, producto_id, sucursal_origen_id, sucursal_destino_id, cantidad, costo_unitario, referencia_tipo, referencia_id, motivo, usuario_nombre, created_at) VALUES
('entrada_compra', 'd0000000-0000-0000-0000-000000000001', NULL, 'a0000000-0000-0000-0000-000000000001', 250, 10.50, 'compra', 'OC-2026-081', 'Recepción de Orden de Compra Trebolac Lácteos', 'Brenda Elizabeth Castillo', NOW() - INTERVAL '2 days'),
('salida_venta', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NULL, 4, 10.50, 'venta', 'FAC-2026-000142', 'Venta en mostrador POS', 'Edwin Josué Lopez', NOW() - INTERVAL '3 hours'),
('transferencia_salida', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 48, 10.50, 'traslado_interno', 'TR-0041', 'Traslado de reabastecimiento a Sucursal Norte', 'Manuel Antonio Rivas', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 14. LOGS DE AUDITORÍA
INSERT INTO auditoria_logs (usuario_nombre, accion, modulo, entidad_id, detalles_json, ip_origen, created_at) VALUES
('Lic. Alejandro Morales (Administrador General)', 'SISTEMA_INICIALIZADO', 'sistema', 'GLOBAL', '{"mensaje": "Base de datos SuperAhorro S.A. configurada y lista para operación multisede"}', '127.0.0.1', NOW() - INTERVAL '2 days'),
('Manuel Antonio Rivas (Encargado de Inventario y Lotes)', 'AJUSTE_INVENTARIO', 'inventario', 'd0000000-0000-0000-0000-000000000008', '{"sucursal": "Sucursal Norte", "motivo": "Merma por rotura de empaque", "cantidad": -2}', '192.168.1.15', NOW() - INTERVAL '5 hours'),
('Edwin Josué Lopez (Cajero Principal)', 'VENTA_POS_REGISTRADA', 'pos', 'FAC-2026-000142', '{"total": 131.00, "metodo": "tarjeta_credito", "cliente": "4589231-8"}', '192.168.1.50', NOW() - INTERVAL '3 hours');

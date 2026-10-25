// ==============================================================================
// SISTEMA INTEGRAL DE SUPERMERCADO SUPERAHORRO S.A.
// Definición de Tipos de Dominio y Modelos TypeScript
// ==============================================================================

export type RolUsuario = 
  | 'admin' 
  | 'gerente_sucursal' 
  | 'cajero' 
  | 'encargado_inventario' 
  | 'encargado_compras';

export type TipoMovimientoStock = 
  | 'entrada_compra' 
  | 'salida_venta' 
  | 'transferencia_salida' 
  | 'transferencia_entrada' 
  | 'ajuste_positivo' 
  | 'ajuste_merma';

export type EstadoOrdenCompra = 'borrador' | 'solicitada' | 'aprobada' | 'recibida' | 'cancelada';

export type MetodoPago = 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'puntos_fidelidad' | 'mixto';

export type TipoPromocion = 'porcentaje' | 'monto_fijo' | 'dos_por_uno' | 'combo';

export type EstadoLote = 'vigente' | 'por_vencer' | 'vencido' | 'agotado';

export type NivelFidelizacion = 'Bronce' | 'Plata' | 'Oro' | 'Diamante';

export interface Sucursal {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  municipio: string;
  departamento: string;
  telefono: string;
  email: string;
  es_matriz: boolean;
  activo: boolean;
  created_at?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color_badge: string;
  activo?: boolean;
}

export interface Marca {
  id: string;
  nombre: string;
  pais_origen: string;
  activo?: boolean;
}

export interface Producto {
  id: string;
  sku: string;
  barcode: string;
  nombre: string;
  descripcion: string;
  categoria_id: string;
  categoria_nombre?: string;
  marca_id: string;
  marca_nombre?: string;
  unidad_medida: string; // Unidad, Litro, Kg, Paquete, etc.
  costo_promedio: number;
  precio_venta: number;
  precio_mayoreo: number;
  iva_porcentaje: number;
  stock_minimo: number;
  stock_maximo: number;
  es_perecedero: boolean;
  imagen_url?: string;
  activo: boolean;
  created_at?: string;
}

export interface Lote {
  id: string;
  producto_id: string;
  producto_nombre?: string;
  producto_sku?: string;
  sucursal_id: string;
  sucursal_nombre?: string;
  numero_lote: string;
  fecha_fabricacion?: string;
  fecha_vencimiento: string;
  cantidad_inicial: number;
  cantidad_disponible: number;
  costo_compra: number;
  estado: EstadoLote;
  notas?: string;
  dias_para_vencer?: number;
}

export interface InventarioSucursal {
  id: string;
  producto_id: string;
  producto?: Producto;
  sucursal_id: string;
  sucursal_nombre?: string;
  stock_actual: number;
  stock_reservado: number;
  stock_minimo_local: number;
  pasillo_ubicacion: string;
  updated_at?: string;
}

export interface MovimientoStock {
  id: string;
  tipo_movimiento: TipoMovimientoStock;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  sucursal_origen_id?: string;
  sucursal_origen_nombre?: string;
  sucursal_destino_id?: string;
  sucursal_destino_nombre?: string;
  lote_id?: string;
  cantidad: number;
  costo_unitario: number;
  referencia_tipo: string;
  referencia_id: string;
  motivo: string;
  usuario_id?: string;
  usuario_nombre: string;
  created_at: string;
}

export interface Cliente {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string;
  puntos_acumulados: number;
  nivel_fidelizacion: NivelFidelizacion;
  activo: boolean;
  created_at?: string;
}

export interface Proveedor {
  id: string;
  nit: string;
  razon_social: string;
  nombre_comercial: string;
  contacto_nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  dias_credito: number;
  activo: boolean;
  created_at?: string;
}

export interface OrdenCompraDetalle {
  id?: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  cantidad_solicitada: number;
  cantidad_recibida?: number;
  costo_unitario: number;
  subtotal: number;
  numero_lote?: string;
  fecha_vencimiento?: string;
}

export interface OrdenCompra {
  id: string;
  numero_orden: string;
  proveedor_id: string;
  proveedor_nombre?: string;
  sucursal_destino_id: string;
  sucursal_destino_nombre?: string;
  estado: EstadoOrdenCompra;
  fecha_emision: string;
  fecha_esperada?: string;
  fecha_recepcion?: string;
  subtotal: number;
  iva: number;
  total: number;
  notas?: string;
  creado_por: string;
  detalles: OrdenCompraDetalle[];
  created_at?: string;
}

export interface CajaPOS {
  id: string;
  sucursal_id: string;
  codigo_caja: string;
  nombre: string;
  estado: 'abierta' | 'cerrada';
  monto_fondo_base: number;
}

export interface TurnoPOS {
  id: string;
  caja_id: string;
  caja_nombre: string;
  cajero_nombre: string;
  fecha_apertura: string;
  fecha_cierre?: string;
  monto_inicial: number;
  monto_ventas_efectivo: number;
  monto_ventas_tarjeta: number;
  monto_total_sistema: number;
  monto_cierre_declarado?: number;
  diferencia?: number;
  estado: 'abierto' | 'cerrado';
}

export interface CartItem {
  producto: Producto;
  lote?: Lote;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
  stock_disponible: number;
}

export interface VentaDetalleItem {
  id?: string;
  producto_id: string;
  producto_nombre: string;
  producto_sku: string;
  lote_id?: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
}

export interface Venta {
  id: string;
  serie_factura: string;
  numero_factura: string;
  sucursal_id: string;
  sucursal_nombre?: string;
  caja_id?: string;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_nit: string;
  cajero_nombre: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodo_pago: MetodoPago;
  monto_recibido: number;
  cambio: number;
  puntos_otorgados: number;
  puntos_canjeados: number;
  descuento_puntos: number;
  estado: 'completada' | 'anulada';
  autorizacion_fel?: string;
  detalles?: VentaDetalleItem[];
  created_at: string;
}

export interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoPromocion;
  valor_descuento: number;
  categoria_id?: string;
  categoria_nombre?: string;
  producto_id?: string;
  producto_nombre?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
}

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  sucursal_asignada_id?: string;
  sucursal_asignada_nombre?: string;
  telefono?: string;
  avatar_url?: string;
  activo: boolean;
  ultimo_acceso?: string;
}

export interface AuditoriaLog {
  id: string;
  usuario_nombre: string;
  accion: string;
  modulo: string;
  entidad_id: string;
  detalles_json: Record<string, any>;
  ip_origen: string;
  created_at: string;
}

export interface DashboardMetrics {
  ventas_totales_hoy: number;
  transacciones_hoy: number;
  ticket_promedio: number;
  productos_stock_critico: number;
  lotes_por_vencer: number;
  ordenes_compra_pendientes: number;
  comparativo_semana_anterior_pct: number;
}

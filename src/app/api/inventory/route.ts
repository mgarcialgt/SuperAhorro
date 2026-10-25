import { NextResponse } from "next/server";
import { SuperAhorroDB } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || undefined;
    const inventario = await SuperAhorroDB.getInventario(sucursalId);
    return NextResponse.json({ success: true, count: inventario.length, data: inventario });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, sucursalOrigenId, sucursalDestinoId, sucursalId, productoId, cantidad, motivo } = body;

    if (tipo === "transferencia") {
      await SuperAhorroDB.transferStock(
        sucursalOrigenId,
        sucursalDestinoId,
        productoId,
        cantidad,
        "API_Operator",
        motivo
      );
      return NextResponse.json({ success: true, message: "Traslado registrado con éxito" });
    } else if (tipo === "merma") {
      await SuperAhorroDB.adjustStockMerma(
        sucursalId,
        productoId,
        cantidad,
        motivo,
        "API_Operator"
      );
      return NextResponse.json({ success: true, message: "Ajuste de merma registrado" });
    }

    return NextResponse.json({ success: false, error: "Tipo de operación no reconocida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

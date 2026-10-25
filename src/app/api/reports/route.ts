import { NextResponse } from "next/server";
import { SuperAhorroDB } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get("sucursalId") || undefined;
    const metrics = await SuperAhorroDB.getDashboardMetrics(sucursalId);
    const ventas = await SuperAhorroDB.getVentas(sucursalId);

    return NextResponse.json({
      success: true,
      metrics,
      totalVentasCount: ventas.length,
      data: ventas,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

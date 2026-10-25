import { NextResponse } from "next/server";
import { SuperAhorroDB } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const venta = await SuperAhorroDB.procesarVentaPOS(body);
    return NextResponse.json({ success: true, data: venta }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

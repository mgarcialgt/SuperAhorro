import { NextResponse } from "next/server";
import { SuperAhorroDB } from "@/lib/storage";

export async function GET() {
  try {
    const productos = await SuperAhorroDB.getProductos();
    return NextResponse.json({ success: true, count: productos.length, data: productos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = await SuperAhorroDB.saveProducto(body, "API_User");
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

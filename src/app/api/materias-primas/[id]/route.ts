import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const TIENDAS = ["Norte", "Sur", "Oriental", "Occidental"] as const;

function tiendaTable(tienda: string) {
  const map: Record<string, any> = {
    Norte: prisma.materias_primas_norte,
    Sur: prisma.materias_primas_sur,
    Oriental: prisma.materias_primas_oriente,
    Occidental: prisma.materias_primas_occidente,
  };
  return map[tienda];
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const existing = await prisma.materias_primas_norte.findUnique({ where: { id_materia_prima: id } });
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const nombre = body.nombre ?? existing.nombre;
  const base = {
    nombre,
    categoria: body.categoria ?? existing.categoria,
    unidad_medida: body.unidad_medida ?? existing.unidad_medida,
    stock_maximo: body.stock_maximo ?? Number(existing.stock_maximo),
    umbral_alerta_pct: body.umbral_alerta_pct ?? Number(existing.umbral_alerta_pct),
    costo_unitario: body.costo_unitario ?? Number(existing.costo_unitario),
  };

  const stockMap: Record<string, number> = {
    Norte: body.stock_norte ?? body.stock_disponible ?? 0,
    Sur: body.stock_sur ?? 0,
    Oriental: body.stock_oriental ?? 0,
    Occidental: body.stock_occidental ?? 0,
  };

  await Promise.all(
    TIENDAS.map((t) =>
      tiendaTable(t).updateMany({
        where: { nombre },
        data: { ...base, stock_disponible: stockMap[t] },
      })
    )
  );

  const primero = await prisma.materias_primas_norte.findFirst({ where: { nombre } });
  if (!primero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    id_materia_prima: primero.id_materia_prima,
    nombre: primero.nombre,
    categoria: primero.categoria,
    unidad_medida: primero.unidad_medida,
    stock_norte: stockMap.Norte,
    stock_sur: stockMap.Sur,
    stock_oriental: stockMap.Oriental,
    stock_occidental: stockMap.Occidental,
    stock_disponible: Object.values(stockMap).reduce((a, b) => a + b, 0),
    stock_maximo: Number(primero.stock_maximo),
    umbral_alerta_pct: Number(primero.umbral_alerta_pct),
    costo_unitario: Number(primero.costo_unitario),
    fecha_actualizacion: primero.fecha_actualizacion,
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const item = await prisma.materias_primas_norte.findUnique({ where: { id_materia_prima: id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await Promise.all(
    TIENDAS.map((t) => tiendaTable(t).deleteMany({ where: { nombre: item.nombre } }))
  );

  return NextResponse.json({ success: true });
}

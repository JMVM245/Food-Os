import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function tiendaTable(tienda: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map: Record<string, any> = {
    Norte: prisma.materias_primas_norte,
    Sur: prisma.materias_primas_sur,
    Oriental: prisma.materias_primas_oriente,
    Occidental: prisma.materias_primas_occidente,
  };
  return map[tienda];
}

const TIENDAS = ["Norte", "Sur", "Oriental", "Occidental"] as const;

export async function GET() {
  const results = await Promise.all(
    TIENDAS.map((t) => tiendaTable(t).findMany({ orderBy: { id_materia_prima: "asc" } }))
  );

  const mapa = new Map<string, Record<string, unknown>>();

  for (let ti = 0; ti < TIENDAS.length; ti++) {
    const tienda = TIENDAS[ti];
    for (const m of results[ti]) {
      const existente = mapa.get(m.nombre);
      const stockKey = `stock_${tienda.toLowerCase()}` as const;
      if (existente) {
        existente[stockKey] = Number(m.stock_disponible);
        existente.stock_disponible = (existente.stock_disponible as number ?? 0) + Number(m.stock_disponible);
      } else {
        const entry: Record<string, unknown> = {
          id_materia_prima: m.id_materia_prima,
          nombre: m.nombre,
          categoria: m.categoria,
          unidad_medida: m.unidad_medida,
          stock_norte: 0,
          stock_sur: 0,
          stock_oriental: 0,
          stock_occidental: 0,
          stock_disponible: Number(m.stock_disponible),
          stock_maximo: Number(m.stock_maximo),
          umbral_alerta_pct: Number(m.umbral_alerta_pct),
          costo_unitario: Number(m.costo_unitario),
          fecha_actualizacion: m.fecha_actualizacion,
        };
        entry[stockKey] = Number(m.stock_disponible);
        mapa.set(m.nombre, entry);
      }
    }
  }

  return NextResponse.json(Array.from(mapa.values()));
}

export async function POST(req: Request) {
  const body = await req.json();
  const base = {
    nombre: body.nombre,
    categoria: body.categoria ?? null,
    unidad_medida: body.unidad_medida,
    stock_maximo: body.stock_maximo ?? 100,
    umbral_alerta_pct: body.umbral_alerta_pct ?? 20,
    costo_unitario: body.costo_unitario ?? 0,
  };

  const stockMap: Record<string, number> = {
    Norte: body.stock_norte ?? body.stock_disponible ?? 0,
    Sur: body.stock_sur ?? 0,
    Oriental: body.stock_oriental ?? 0,
    Occidental: body.stock_occidental ?? 0,
  };

  const results = await Promise.all(
    TIENDAS.map((t) => tiendaTable(t).create({ data: { ...base, stock_disponible: stockMap[t] } }))
  );

  const primero = results[0];
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
  }, { status: 201 });
}

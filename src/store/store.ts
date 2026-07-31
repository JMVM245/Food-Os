"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import {
  PRODUCTOS_INICIALES,
  VENDEDORES_DEMO,
  PUNTOS_RECOLECCION_INICIALES,
  COMBOS_INICIALES,
  type Producto,
  type Zona,
  type Tienda,
  type PuntoRecoleccion,
} from "@/lib/data";
import {
  MATERIAS_PRIMAS_INICIALES,
  type MateriaPrima,
} from "@/lib/materias-primas";

export interface Asiento {
  tribuna: Zona | null;
  fila: string;
  silla: string;
  codigoBoleta: string;
}

export interface ItemPedido {
  productoId: string;
  nombre: string;
  emoji: string;
  precio: number;
  cantidad: number;
  variante?: { id: string; nombre: string; precioExtra: number };
  comboId?: string;
}

export interface ItemCarrito {
  productoId: string;
  cantidad: number;
  varianteId?: string;
  comboId?: string;
}

export type EstadoPedido = "preparando" | "en_camino" | "notificado" | "entregado";
export type TipoEntrega = "delivery" | "pickup";

export interface Pedido {
  id: string;
  zona: Zona;
  tribuna: Zona;
  fila: string;
  silla: string;
  codigoBoleta: string;
  items: ItemPedido[];
  total: number;
  estado: EstadoPedido;
  pagado: boolean;
  tipoEntrega: TipoEntrega;
  vendedor: { nombre: string; codigo: string };
  creadoEn: number;
  tiempoEstimadoMin: number;
  horaEntrega?: string;
  entregadoEn?: number;
  satisfaccion?: {
    puntuacion: number;
    atencion: number;
    calidad: number;
    rapidez: number;
    comentario: string;
  };
}

export interface PartidoState {
  iniciado: boolean;
  inicioEn: number | null;
  medioTiempo: boolean;
  finalizado: boolean;
}

export const HORAS_DEL_DIA = [
  "12:00","12:20","12:40","13:00","13:20","13:40","14:00",
  "15:00","15:20","15:40","16:00","16:20","16:40","17:00",
  "18:00","18:20","18:40","19:00","19:20","19:40","20:00",
];

export const MAX_PEDIDOS_POR_FRANJA = 100;

function inicializarFranjas(): Record<string, Record<Zona, number>> {
  const franjas: Record<string, Record<Zona, number>> = {};
  for (const h of HORAS_DEL_DIA) {
    franjas[h] = { Norte: 0, Sur: 0, Oriental: 0, Occidental: 0 };
  }
  return franjas;
}

interface StoreState {
  asiento: Asiento;
  setAsiento: (a: Partial<Asiento>) => void;

  vendedorZona: Zona | null;
  setVendedorZona: (z: Zona | null) => void;

  puntosRecoleccion: PuntoRecoleccion[];
  puntoActivo: PuntoRecoleccion | null;
  setPuntoActivo: (p: PuntoRecoleccion | null) => void;

  productos: Producto[];
  addProducto: (p: Producto) => void;
  updateProducto: (id: string, data: Partial<Pick<Producto, "nombre" | "emoji" | "precio" | "categoria">>) => void;
  setStock: (productoId: string, zona: Zona, cantidad: number) => void;

  carrito: ItemCarrito[];
  addToCart: (productoId: string, varianteId?: string, comboId?: string) => void;
  removeFromCart: (productoId: string, varianteId?: string) => void;
  setCantidad: (productoId: string, cantidad: number, varianteId?: string) => void;
  clearCart: () => void;

  tipoEntrega: TipoEntrega;
  setTipoEntrega: (t: TipoEntrega) => void;
  tiendaActiva: Tienda;
  setTiendaActiva: (t: Tienda) => void;

  pedidos: Pedido[];
  crearPedido: (horaEntrega?: string) => string | null;
  cancelarPedido: (pedidoId: string) => void;
  updatePedidoItems: (pedidoId: string, items: ItemPedido[]) => void;
  marcarListo: (pedidoId: string) => void;
  notificarCliente: (pedidoId: string) => void;
  marcarEntregado: (pedidoId: string) => void;
  setSatisfaccion: (pedidoId: string, s: NonNullable<Pedido["satisfaccion"]>) => void;

  ingresoVendedor: { activo: boolean; horaInicio: string | null };
  setIngresoVendedor: (activo: boolean, horaInicio?: string | null) => void;

  reservadoPorZona: (productoId: string, zona: Zona) => number;
  disponiblePorZona: (productoId: string, zona: Zona) => number;

  materiasPrimas: MateriaPrima[];
  setMateriaPrimaStock: (id: string, stock: number) => void;

  partido: PartidoState;
  iniciarPartido: () => void;
  setMedioTiempo: (v: boolean) => void;
  finalizarPartido: () => void;

  disponible: boolean;
  setDisponible: (v: boolean) => void;

  franjasOcupadas: Record<string, Record<Zona, number>>;
  disponibleEnFranja: (hora: string, zona: Zona) => number;

  resetDemo: () => void;
}

function generarId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function syncPedidoToSupabase(pedido: Pedido) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("pedidos").upsert({
      id: pedido.id,
      zona: pedido.zona,
      tribuna: pedido.tribuna,
      fila: pedido.fila,
      silla: pedido.silla,
      items: pedido.items,
      total: pedido.total,
      estado: pedido.estado,
      vendedor_nombre: pedido.vendedor.nombre,
      vendedor_codigo: pedido.vendedor.codigo,
      creado_en: new Date(pedido.creadoEn).toISOString(),
      tiempo_estimado_min: pedido.tiempoEstimadoMin,
      entregado_en: pedido.entregadoEn ? new Date(pedido.entregadoEn).toISOString() : null,
    });
    if (error) console.warn("Supabase sync error (pedidos):", error.message);
  } catch {
    /* skip */
  }
}

async function syncEntregaToSupabase(pedido: Pedido) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from("pedidos").update({
      estado: "entregado",
      entregado_en: new Date(pedido.entregadoEn!).toISOString(),
    }).eq("id", pedido.id);
    if (error) console.warn("Supabase sync error (entrega):", error.message);
  } catch {
    /* skip */
  }
}

const FRANJAS_INICIALES = inicializarFranjas();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      asiento: { tribuna: null, fila: "", silla: "", codigoBoleta: "" },
      setAsiento: (a) => set((s) => ({ asiento: { ...s.asiento, ...a } })),

      vendedorZona: null,
      setVendedorZona: (z) => set({ vendedorZona: z }),

      puntosRecoleccion: PUNTOS_RECOLECCION_INICIALES,
      puntoActivo: null,
      setPuntoActivo: (p) => set({ puntoActivo: p }),

      productos: PRODUCTOS_INICIALES,

      tipoEntrega: "delivery",
      setTipoEntrega: (t) => set({ tipoEntrega: t }),
      tiendaActiva: "Norte",
      setTiendaActiva: (t) => set({ tiendaActiva: t }),

      carrito: [],
      addToCart: (productoId: string, varianteId?: string, comboId?: string) =>
        set((s) => {
          const key = (i: { productoId: string; varianteId?: string; comboId?: string }) => i.productoId + (i.varianteId ?? "") + (i.comboId ?? "");
          const existe = s.carrito.find((i) => key(i) === key({ productoId, varianteId, comboId }));
          if (existe) {
            return {
              carrito: s.carrito.map((i) =>
                key(i) === key(existe) ? { ...i, cantidad: i.cantidad + 1 } : i
              ),
            };
          }
          return { carrito: [...s.carrito, { productoId, cantidad: 1, varianteId, comboId }] };
        }),
      removeFromCart: (productoId, varianteId?) =>
        set((s) => {
          const key = (i: { productoId: string; varianteId?: string }) => i.productoId + (i.varianteId ?? "");
          return { carrito: s.carrito.filter((i) => key(i) !== key({ productoId, varianteId })) };
        }),
      setCantidad: (productoId, cantidad, varianteId?) =>
        set((s) => {
          const key = (i: { productoId: string; varianteId?: string }) => i.productoId + (i.varianteId ?? "");
          if (cantidad <= 0) {
            return { carrito: s.carrito.filter((i) => key(i) !== key({ productoId, varianteId })) };
          }
          return {
            carrito: s.carrito.map((i) =>
              key(i) === key({ productoId, varianteId }) ? { ...i, cantidad } : i
            ),
          };
        }),
      clearCart: () => set({ carrito: [] }),

      addProducto: (p) =>
        set((s) => ({ productos: [...s.productos, p] })),
      updateProducto: (id, data) =>
        set((s) => ({
          productos: s.productos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      setStock: (productoId, zona, cantidad) =>
        set((s) => ({
          productos: s.productos.map((p) =>
            p.id === productoId ? { ...p, stock: { ...p.stock, [zona]: cantidad } } : p
          ),
        })),

      materiasPrimas: MATERIAS_PRIMAS_INICIALES,
      setMateriaPrimaStock: (id, stock) =>
        set((s) => ({
          materiasPrimas: s.materiasPrimas.map((mp) =>
            mp.id === id ? { ...mp, stockDisponible: stock } : mp
          ),
        })),

      pedidos: [],

      franjasOcupadas: { ...FRANJAS_INICIALES },

      disponibleEnFranja: (hora, zona) => {
        const { franjasOcupadas } = get();
        const ocupados = franjasOcupadas[hora]?.[zona] ?? 0;
        return MAX_PEDIDOS_POR_FRANJA - ocupados;
      },

      reservadoPorZona: (productoId, zona) => {
        const { pedidos } = get();
        return pedidos
          .filter((p) => p.zona === zona && p.tipoEntrega === "delivery" && (p.estado === "preparando" || p.estado === "en_camino" || p.estado === "notificado"))
          .flatMap((p) => p.items)
          .filter((i) => i.productoId === productoId)
          .reduce((acc, i) => acc + i.cantidad, 0);
      },

      disponiblePorZona: (productoId, zona) => {
        const { productos, reservadoPorZona } = get();
        const producto = productos.find((p) => p.id === productoId);
        if (!producto) return 0;
        return producto.stock[zona] - reservadoPorZona(productoId, zona);
      },

      crearPedido: (horaEntrega?) => {
        const { asiento, carrito, productos, disponiblePorZona, tipoEntrega, franjasOcupadas, tiendaActiva } = get();
        if (tipoEntrega === "delivery" && !asiento.tribuna) return null;
        if (carrito.length === 0) return null;

        const zona = tipoEntrega === "delivery" ? asiento.tribuna! : tiendaActiva;
        const tienda = tipoEntrega === "pickup" ? tiendaActiva : undefined;

        if (tipoEntrega === "delivery" && horaEntrega) {
          const disp = get().disponibleEnFranja(horaEntrega, zona);
          if (disp < 1) return null;
        }

        for (const item of carrito) {
          if (tipoEntrega === "pickup" && tienda) {
            const p = productos.find((prod) => prod.id === item.productoId);
            if (!p || (p.stockTienda[tienda] ?? 0) < item.cantidad) return null;
          } else {
            const disp = disponiblePorZona(item.productoId, zona);
            if (disp < item.cantidad) return null;
          }
        }

        const itemsConCombo: ItemPedido[] = carrito.map((c) => {
          const p = productos.find((prod) => prod.id === c.productoId) as Producto;
          const v = c.varianteId ? p.variantes?.find((v) => v.id === c.varianteId) : undefined;
          return {
            productoId: p.id,
            nombre: p.nombre,
            emoji: p.emoji,
            precio: p.precio + (v?.precioExtra ?? 0),
            cantidad: c.cantidad,
            variante: v ? { id: v.id, nombre: v.nombre, precioExtra: v.precioExtra } : undefined,
            comboId: c.comboId,
          };
        });

        const combosAgrupados = new Map<string, ItemPedido[]>();
        for (const item of itemsConCombo) {
          if (item.comboId) {
            const arr = combosAgrupados.get(item.comboId) ?? [];
            arr.push(item);
            combosAgrupados.set(item.comboId, arr);
          }
        }

        for (const [, grupo] of Array.from(combosAgrupados)) {
          const comboDef = COMBOS_INICIALES.find((c) => c.id === grupo[0].comboId);
          if (!comboDef) continue;
          const totalNormal = grupo.reduce((acc: number, i) => acc + i.precio * i.cantidad, 0);
          const ratio = totalNormal > 0 ? comboDef.precioCombo / totalNormal : 1;
          for (const item of grupo) {
            item.precio = Math.round(item.precio * ratio);
          }
        }

        const items = itemsConCombo.map(({ comboId, ...rest }) => { void comboId; return rest; });
        const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
        const vendedor = VENDEDORES_DEMO[zona];
        const tiempoEstimadoMin = tipoEntrega === "pickup" ? 5 + Math.floor(Math.random() * 5) : 8 + Math.floor(Math.random() * 8);

        const pedido: Pedido = {
          id: generarId(),
          zona,
          tribuna: zona,
          fila: "-",
          silla: "-",
          codigoBoleta: asiento.codigoBoleta || "",
          items,
          total,
          estado: "preparando",
          pagado: true,
          tipoEntrega,
          vendedor,
          creadoEn: Date.now(),
          tiempoEstimadoMin,
          horaEntrega: tipoEntrega === "delivery" ? horaEntrega : undefined,
        };

        const nuevosProductos = tipoEntrega === "pickup" && tienda
          ? productos.map((prod) => {
              const item = items.find((i) => i.productoId === prod.id);
              if (!item) return prod;
              return {
                ...prod,
                stockTienda: {
                  ...prod.stockTienda,
                  [tienda]: Math.max(0, (prod.stockTienda[tienda] ?? 0) - item.cantidad),
                },
              };
            })
          : tipoEntrega === "delivery"
            ? productos.map((prod) => {
                const item = items.find((i) => i.productoId === prod.id);
                if (!item) return prod;
                return {
                  ...prod,
                  stock: {
                    ...prod.stock,
                    [zona]: Math.max(0, prod.stock[zona] - item.cantidad),
                  },
                };
              })
            : productos;

        const nuevasFranjas = tipoEntrega === "delivery" && horaEntrega
          ? {
              ...franjasOcupadas,
              [horaEntrega]: {
                ...franjasOcupadas[horaEntrega],
                [zona]: (franjasOcupadas[horaEntrega]?.[zona] ?? 0) + 1,
              },
            }
          : franjasOcupadas;

        set((s) => ({ pedidos: [pedido, ...s.pedidos], carrito: [], productos: nuevosProductos, franjasOcupadas: nuevasFranjas }));

        syncPedidoToSupabase(pedido);

        return pedido.id;
      },

      marcarListo: (pedidoId) =>
        set((s) => {
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.estado !== "preparando") return s;
          const nuevoEstado: EstadoPedido = pedido.tipoEntrega === "pickup" ? "entregado" : "en_camino";
          const data: Partial<Pedido> = { estado: nuevoEstado };
          if (nuevoEstado === "entregado") data.entregadoEn = Date.now();
          const pedidos = s.pedidos.map((p) => p.id === pedidoId ? { ...p, ...data } : p);
          return { pedidos };
        }),

      notificarCliente: (pedidoId) =>
        set((s) => {
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.estado !== "en_camino") return s;
          const pedidos = s.pedidos.map((p) => p.id === pedidoId ? { ...p, estado: "notificado" as const } : p);
          return { pedidos };
        }),

      marcarEntregado: (pedidoId) =>
        set((s) => {
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.estado === "entregado" || pedido.estado === "preparando") return s;

          const productos = pedido.tipoEntrega === "delivery"
            ? s.productos.map((prod) => {
                const item = pedido.items.find((i) => i.productoId === prod.id);
                if (!item) return prod;
                return {
                  ...prod,
                  stock: {
                    ...prod.stock,
                    [pedido.zona]: Math.max(0, prod.stock[pedido.zona] - item.cantidad),
                  },
                };
              })
            : s.productos;

          const pedidos = s.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, estado: "entregado" as const, entregadoEn: Date.now() } : p
          );

          const nuevoPedido = pedidos.find((p) => p.id === pedidoId);
          if (nuevoPedido) syncEntregaToSupabase(nuevoPedido);

          return { productos, pedidos };
        }),

      cancelarPedido: (pedidoId) =>
        set((s) => {
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.estado === "entregado" || pedido.estado === "notificado") return s;
          const productos = s.productos.map((prod) => {
            const item = pedido.items.find((i) => i.productoId === prod.id);
            if (!item) return prod;
            return {
              ...prod,
              stock: { ...prod.stock, [pedido.zona]: prod.stock[pedido.zona] + item.cantidad },
            };
          });

          let nuevasFranjas = s.franjasOcupadas;
          if (pedido.horaEntrega) {
            const hora = pedido.horaEntrega;
            nuevasFranjas = {
              ...nuevasFranjas,
              [hora]: {
                ...nuevasFranjas[hora],
                [pedido.zona]: Math.max(0, (nuevasFranjas[hora]?.[pedido.zona] ?? 0) - 1),
              },
            };
          }

          return {
            productos,
            pedidos: s.pedidos.filter((p) => p.id !== pedidoId),
            franjasOcupadas: nuevasFranjas,
          };
        }),

      updatePedidoItems: (pedidoId, nuevosItems) =>
        set((s) => {
          const pedido = s.pedidos.find((p) => p.id === pedidoId);
          if (!pedido || pedido.estado === "entregado" || pedido.estado === "notificado") return s;
          const nuevoTotal = nuevosItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
          const productos = s.productos.map((prod) => {
            const nuevoItem = nuevosItems.find((i) => i.productoId === prod.id);
            const originalItem = pedido.items.find((i) => i.productoId === prod.id);
            const diffCant = (nuevoItem?.cantidad ?? 0) - (originalItem?.cantidad ?? 0);
            if (diffCant === 0) return prod;
            return {
              ...prod,
              stock: { ...prod.stock, [pedido.zona]: Math.max(0, prod.stock[pedido.zona] - diffCant) },
            };
          });
          return {
            productos,
            pedidos: s.pedidos.map((p) =>
              p.id === pedidoId ? { ...p, items: nuevosItems, total: nuevoTotal } : p
            ),
          };
        }),

      setSatisfaccion: (pedidoId, s) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, satisfaccion: s } : p
          ),
        })),

      ingresoVendedor: { activo: false, horaInicio: null },
      setIngresoVendedor: (activo, horaInicio) =>
        set({ ingresoVendedor: { activo, horaInicio: horaInicio ?? null } }),

      partido: { iniciado: false, inicioEn: null, medioTiempo: false, finalizado: false },
      iniciarPartido: () => set({ partido: { iniciado: true, inicioEn: Date.now(), medioTiempo: false, finalizado: false } }),
      setMedioTiempo: (v) => set((s) => ({ partido: { ...s.partido, medioTiempo: v } })),
      finalizarPartido: () => set({ partido: { iniciado: false, inicioEn: null, medioTiempo: false, finalizado: true } }),

      disponible: true,
      setDisponible: (v) => set({ disponible: v }),

      resetDemo: () =>
        set({
          productos: PRODUCTOS_INICIALES,
          materiasPrimas: MATERIAS_PRIMAS_INICIALES,
          pedidos: [],
          carrito: [],
          asiento: { tribuna: null, fila: "", silla: "", codigoBoleta: "" },
          vendedorZona: null,
          puntosRecoleccion: PUNTOS_RECOLECCION_INICIALES,
          puntoActivo: null,
          tipoEntrega: "delivery",
          tiendaActiva: "Norte",
          ingresoVendedor: { activo: false, horaInicio: null },
          partido: { iniciado: false, inicioEn: null, medioTiempo: false, finalizado: false },
          disponible: true,
          franjasOcupadas: { ...FRANJAS_INICIALES },
        }),
    }),
    {
      name: "fifa-delivery-storage",
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) return { ...persistedState as Record<string, unknown>, productos: PRODUCTOS_INICIALES, materiasPrimas: MATERIAS_PRIMAS_INICIALES, pedidos: [], carrito: [] } as unknown as StoreState;
        return persistedState as StoreState;
      },
    }
  )
);

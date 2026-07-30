"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/store";
import { SeatSelector } from "@/components/cliente/seat-selector";
import { ProductCard } from "@/components/cliente/product-card";
import { CartSheet } from "@/components/cliente/cart-sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMBOS_INICIALES } from "@/lib/data";
import { formatoCOP } from "@/components/cliente/product-card";
import { Truck, Eye, CheckCircle2, Timer, Zap, Bell, Store } from "lucide-react";
import "./page.css";

function CombosSection() {
  const partido = useStore((s) => s.partido);
  const addToCart = useStore((s) => s.addToCart);
  const productos = useStore((s) => s.productos);

  if (!partido.medioTiempo || partido.finalizado) return null;

  const nombreProducto = (id: string) => productos.find((p) => p.id === id)?.nombre ?? id;
  const emojiProducto = (id: string) => productos.find((p) => p.id === id)?.emoji ?? "";

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold">Combos de medio tiempo</h2>
        <Badge variant="warning">¡OFERTA!</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Aprovecha los combos especiales durante el medio tiempo. ¡Precio exclusivo!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMBOS_INICIALES.map((combo) => (
          <div
            key={combo.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2 hover:border-accent/50 transition-colors overflow-hidden"
          >
            <div className="flex items-start gap-2">
              <span className="text-base leading-none shrink-0">{combo.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">{combo.nombre}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{combo.descripcion}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs line-through text-muted-foreground shrink-0">
                {formatoCOP.format(combo.precioOriginal)}
              </span>
              <span className="text-base font-bold text-accent shrink-0">
                {formatoCOP.format(combo.precioCombo)}
              </span>
              <Badge variant="success" className="shrink-0 text-[10px] h-5 px-1.5">
                -{Math.round((1 - combo.precioCombo / combo.precioOriginal) * 100)}%
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 min-w-0">
              {combo.productos.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground leading-tight">
                  {emojiProducto(p.productoId)} {p.cantidad}x{nombreProducto(p.productoId)}
                </span>
              ))}
            </div>
            <Button
              size="sm"
              variant="pitch"
              className="w-full mt-auto h-8 text-xs"
              onClick={() => {
                combo.productos.forEach((p) => {
                  for (let i = 0; i < p.cantidad; i++) {
                    addToCart(p.productoId, p.varianteId, combo.id);
                  }
                });
              }}
            >
              <Zap className="h-3.5 w-3.5" /> Agregar combo
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ClientePage() {
  const productos = useStore((s) => s.productos);
  const asiento = useStore((s) => s.asiento);
  const pedidos = useStore((s) => s.pedidos);
  const tipoEntrega = useStore((s) => s.tipoEntrega);
  const tiendaActiva = useStore((s) => s.tiendaActiva);
  const [categoria, setCategoria] = useState<"Todo" | "Comida" | "Bebida">("Todo");

  const pedidoActivo = pedidos.find((p) => p.estado === "preparando" || p.estado === "en_camino" || p.estado === "notificado");
  const ultimoPedido = pedidos.length > 0 ? pedidos.reduce((a, b) => (a.creadoEn > b.creadoEn ? a : b)) : null;
  const bannerPedido = pedidoActivo ?? ultimoPedido;

  const filtrados = useMemo(
    () => productos.filter((p) => categoria === "Todo" || p.categoria === categoria),
    [productos, categoria]
  );

  return (
    <main className="cliente-main">
      {bannerPedido && (
        <Link
          href={`/seguimiento/${bannerPedido.id}`}
          className={`cliente-pedido-activo ${bannerPedido.estado === "entregado" ? "cliente-pedido-entregado" : ""}`}
        >
          {bannerPedido.estado === "entregado" ? (
            <CheckCircle2 className="h-4 w-4 text-pitch-bright" />
          ) : bannerPedido.estado === "notificado" ? (
            <Bell className="h-4 w-4 text-amber-400 animate-pulse" />
          ) : bannerPedido.estado === "preparando" ? (
            <Store className="h-4 w-4 text-accent" />
          ) : (
            <Truck className="h-4 w-4 text-accent animate-pulse-dot" />
          )}
          <span className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide">
              {bannerPedido.estado === "entregado" ? "Último pedido" :
               bannerPedido.estado === "notificado" ? "¡Repartidor en zona!" :
               bannerPedido.estado === "preparando" ? "Preparando pedido" : "Pedido activo"}
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              #{bannerPedido.id} — {bannerPedido.items.length} producto(s)
            </span>
          </span>
          <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      )}

      <header className="cliente-header">
        <div>
          <p className="cliente-badge">
            Estadio Modular · FIFA 2026
          </p>
          <h1 className="cliente-title">
              Pide sin filas,
              <br className="sm:hidden" />             <span className="cliente-title-accent">recoge al</span>{" "}
              <span className="cliente-title-gold">instante</span>.
          </h1>
        </div>
        <div className="pt-1">
          <CartSheet />
        </div>
      </header>

      <div className="cliente-seat-section">
        <SeatSelector />
      </div>

      <CombosSection />

      <Tabs value={categoria} onValueChange={(v) => setCategoria(v as typeof categoria)}>
        <TabsList>
          <TabsTrigger value="Todo">Todo</TabsTrigger>
          <TabsTrigger value="Comida">Comida</TabsTrigger>
          <TabsTrigger value="Bebida">Bebida</TabsTrigger>
        </TabsList>
        <TabsContent value={categoria}>
          <div className="cliente-productos-grid">
            {filtrados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} zona={tipoEntrega === "delivery" ? asiento.tribuna! : tiendaActiva!} esTienda={tipoEntrega === "pickup"} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

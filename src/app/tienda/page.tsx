"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useStore } from "@/store/store";
import { TIENDAS, type Tienda } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatoCOP } from "@/components/cliente/product-card";
import {
  Store, CheckCircle2, LogOut, ShoppingCart, Plus, Minus,
  Clock, Package, ShoppingBag, X, QrCode,
} from "lucide-react";
import "./tienda.css";

const TIENDA_COLORS: Record<Tienda, { bg: string; border: string; text: string }> = {
  Norte: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  Sur: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  Oriental: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  Occidental: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
};

export default function TiendaPage() {
  const [tiendaActiva, setTiendaActiva] = useState<Tienda | null>(null);

  if (!tiendaActiva) {
    return <LoginTienda onSelect={setTiendaActiva} />;
  }

  return <DashboardTienda tienda={tiendaActiva} onSalir={() => setTiendaActiva(null)} />;
}

function LoginTienda({ onSelect }: { onSelect: (t: Tienda) => void }) {
  return (
    <main className="tienda-login-main">
      <div className="tienda-login-header">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Store className="h-4 w-4 text-accent" />
          <p className="tienda-login-badge">Acceso Tienda Física</p>
        </div>
        <h1 className="tienda-login-title">Selecciona tu tienda</h1>
        <p className="tienda-login-desc">Elige la tienda en la que estás ubicado para gestionar pedidos y ventas.</p>
      </div>

      <div className="tienda-login-grid">
        {TIENDAS.map((t) => {
          const color = TIENDA_COLORS[t];
          return (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:scale-[1.02] ${color.border} ${color.bg} hover:shadow-lg`}
            >
              <Store className={`h-10 w-10 ${color.text}`} />
              <span className={`font-display text-lg font-black uppercase ${color.text}`}>Tienda {t}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function DashboardTienda({ tienda, onSalir }: { tienda: Tienda; onSalir: () => void }) {
  const pedidos = useStore((s) => s.pedidos);
  const productos = useStore((s) => s.productos);
  const crearPedido = useStore((s) => s.crearPedido);
  const marcarEntregado = useStore((s) => s.marcarEntregado);
  const setTipoEntrega = useStore((s) => s.setTipoEntrega);
  const setTiendaActiva = useStore((s) => s.setTiendaActiva);
  const [carrito, setCarrito] = useState<{ productoId: string; nombre: string; emoji: string; precio: number; cantidad: number }[]>([]);
  const [showPos, setShowPos] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);

  const pendientes = useMemo(() =>
    pedidos
      .filter((p) => p.zona === tienda && p.estado === "preparando")
      .sort((a, b) => a.creadoEn - b.creadoEn),
    [pedidos, tienda]
  );

  const completadosHoy = useMemo(() =>
    pedidos.filter((p) => p.zona === tienda && p.estado === "entregado").length,
    [pedidos, tienda]
  );

  const marcarListo = useStore((s) => s.marcarListo);
  const addToCart = useStore((s) => s.addToCart);
  const clearCart = useStore((s) => s.clearCart);

  function handleAgregarProducto(prod: typeof productos[0]) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.productoId === prod.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { productoId: prod.id, nombre: prod.nombre, emoji: prod.emoji, precio: prod.precio, cantidad: 1 }];
    });
  }

  function handleQuitarProducto(productoId: string) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.productoId === productoId);
      if (!existente) return prev;
      if (existente.cantidad <= 1) return prev.filter((i) => i.productoId !== productoId);
      return prev.map((i) =>
        i.productoId === productoId ? { ...i, cantidad: i.cantidad - 1 } : i
      );
    });
  }

  function handleCobrar() {
    if (carrito.length === 0) return;
    setMostrarPago(true);
  }

  function handleConfirmarPago() {
    if (carrito.length === 0) return;
    clearCart();
    for (const item of carrito) {
      for (let index = 0; index < item.cantidad; index++) {
        addToCart(item.productoId);
      }
    }
    setTipoEntrega("pickup");
    setTiendaActiva(tienda);
    const creado = crearPedido();
    if (creado) {
      marcarEntregado(creado);
      setCarrito([]);
    }
  }

  const totalCarrito = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const color = TIENDA_COLORS[tienda];

  return (
    <main className="tienda-list-main">
      <header className="tienda-list-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color.bg}`}>
            <Store className={`h-5 w-5 ${color.text}`} />
          </div>
          <div className="min-w-0">
            <p className="tienda-list-info">Tienda física</p>
            <h1 className="tienda-list-title">Tienda {tienda}</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSalir}>
          <LogOut className="h-3.5 w-3.5" /> Cambiar tienda
        </Button>
      </header>

      <div className="tienda-kpi-grid">
        <Card>
          <CardContent className="tienda-kpi-card">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color.bg}`}>
              <ShoppingBag className={`h-5 w-5 ${color.text}`} />
            </div>
            <div>
              <p className="tienda-kpi-number">{pendientes.length}</p>
              <p className="tienda-kpi-label">Por recoger</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="tienda-kpi-card">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pitch-bright/15">
              <CheckCircle2 className="h-5 w-5 text-pitch-bright" />
            </div>
            <div>
              <p className="tienda-kpi-number">{completadosHoy}</p>
              <p className="tienda-kpi-label">Completados hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Button size="sm" variant={showPos ? "default" : "outline"} className="h-9 text-xs w-full" onClick={() => setShowPos(!showPos)}>
          <ShoppingCart className="h-3.5 w-3.5" />
          {showPos ? "Cerrar venta" : "Vender en local"}
        </Button>
      </div>

      {showPos && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Venta en local — Tienda {tienda}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tienda-pos-grid">
              {productos.map((prod) => (
                <button key={prod.id} onClick={() => handleAgregarProducto(prod)} className="tienda-pos-btn">
                  <span className="tienda-pos-emoji">{prod.emoji}</span>
                  <span className="tienda-pos-nombre">{prod.nombre}</span>
                  <span className="tienda-pos-precio">{formatoCOP.format(prod.precio)}</span>
                </button>
              ))}
            </div>

            {carrito.length > 0 && (
              <>
                <Separator className="my-3" />
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Carrito</p>
                <div className="tienda-cart-list">
                  {carrito.map((item) => (
                    <div key={item.productoId} className="tienda-cart-item">
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{item.emoji}</span>
                        <span className="truncate">{item.nombre}</span>
                        <span className="font-mono text-muted-foreground">×{item.cantidad}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-mono text-xs">{formatoCOP.format(item.precio * item.cantidad)}</span>
                        <button onClick={() => handleQuitarProducto(item.productoId)} className="text-muted-foreground hover:text-foreground">
                          <Minus className="h-3 w-3" />
                        </button>
                        <button onClick={() => { const p = productos.find((x) => x.id === item.productoId); if (p) handleAgregarProducto(p); }} className="text-muted-foreground hover:text-foreground">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="font-display font-bold text-gold">{formatoCOP.format(totalCarrito)}</span>
                </div>
                <Button size="sm" className="mt-3 w-full h-9" onClick={handleCobrar}>
                  <QrCode className="h-3.5 w-3.5" /> Cobrar ${totalCarrito.toLocaleString("es-CO")}
                </Button>
              </>
            )}

            {mostrarPago && (
              <PaymentQRModal
                tienda={tienda}
                carrito={carrito}
                totalCarrito={totalCarrito}
                onConfirmar={handleConfirmarPago}
                onCancelar={() => setMostrarPago(false)}
              />
            )}
          </CardContent>
        </Card>
      )}

      <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Pedidos para recoger</h2>

      {pendientes.length === 0 ? (
        <div className="tienda-empty">
          <Package className="tienda-empty-icon" />
          <p className="tienda-empty-text">No hay pedidos pendientes por recoger en esta tienda.</p>
          {completadosHoy > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{completadosHoy} recogido{completadosHoy !== 1 ? "s" : ""} hoy.</p>
          )}
        </div>
      ) : (
        <ul className="tienda-pedidos-list">
          {pendientes.map((pedido) => (
            <Card key={pedido.id} className="overflow-hidden">
              <div className={`h-1 ${color.bg}`} />
              <CardHeader className="tienda-card-header">
                <CardTitle className="tienda-card-title">
                  {pedido.tipoEntrega === "pickup" ? (
                    <Store className="h-4 w-4 text-accent" />
                  ) : (
                    <Package className="h-4 w-4 text-sky-400" />
                  )}
                  <span>{pedido.tipoEntrega === "pickup" ? "Recoger en tienda" : `Delivery · Fila ${pedido.fila} · Silla ${pedido.silla}`}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor((Date.now() - pedido.creadoEn) / 60000)} min
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="tienda-card-items">
                  {pedido.items.map((item, idx) => (
                    <div key={item.productoId + idx} className="tienda-card-item">
                      <span><span className="text-base">{item.emoji}</span> {item.cantidad}x {item.nombre}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="tienda-card-footer">
                  <span className="tienda-card-total">{formatoCOP.format(pedido.total)}</span>
                  <Button size="sm" variant={pedido.tipoEntrega === "pickup" ? "pitch" : "default"} className="h-8 text-xs" onClick={() => marcarListo(pedido.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {pedido.tipoEntrega === "pickup" ? "Listo para recoger" : "Listo para reparto"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </main>
  );
}

function PaymentQRModal({
  tienda, carrito, totalCarrito, onConfirmar, onCancelar,
}: {
  tienda: Tienda;
  carrito: { productoId: string; nombre: string; emoji: string; precio: number; cantidad: number }[];
  totalCarrito: number;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pagado, setPagado] = useState(false);
  const ref = useRef(`TIENDA-${tienda.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`).current;

  useEffect(() => {
    import("qrcode").then((mod) => {
      mod.default.toDataURL(
        `fifa-delivery://pago?tienda=${tienda}&total=${totalCarrito}&ref=${ref}`,
        { width: 240, margin: 2, color: { dark: "#1a1a2e", light: "#ffffff" } },
        (err, url) => { if (!err) setQrDataUrl(url); }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = TIENDA_COLORS[tienda];

  if (pagado) {
    return (
      <div className="tienda-qr-overlay">
        <div className="tienda-qr-modal">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-pitch-bright/15">
              <CheckCircle2 className="h-8 w-8 text-pitch-bright" />
            </div>
            <h2 className="font-display text-xl font-black uppercase text-pitch-bright">¡Pago exitoso!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Venta completada en Tienda {tienda}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Ref: {ref}
            </p>
            <Button size="sm" className="mt-2 h-9" onClick={onCancelar}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tienda-qr-overlay">
      <div className="tienda-qr-modal">
        <button className="tienda-qr-close" onClick={onCancelar}>
          <X className="h-4 w-4" />
        </button>

        <div className="tienda-qr-header">
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${color.bg}`}>
            <Store className={`h-5 w-5 ${color.text}`} />
          </div>
          <div>
            <p className="tienda-qr-label">Pago en tienda</p>
            <h2 className="tienda-qr-title">Tienda {tienda}</h2>
          </div>
        </div>

        <div className="tienda-qr-body">
          <div className="tienda-qr-code">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR de pago" className="tienda-qr-img" />
            ) : (
              <div className="tienda-qr-loading">Generando QR...</div>
            )}
          </div>

          <div className="tienda-qr-items">
            {carrito.map((item) => (
              <div key={item.productoId} className="tienda-qr-item">
                <span>{item.emoji} {item.nombre} ×{item.cantidad}</span>
                <span className="font-mono">{formatoCOP.format(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="tienda-qr-total">
            <span>Total</span>
            <span className="font-display font-bold text-gold">{formatoCOP.format(totalCarrito)}</span>
          </div>

          <p className="tienda-qr-ref">
            Referencia: <span className="font-mono">{ref}</span>
          </p>
        </div>

        <div className="tienda-qr-actions">
          <Button variant="outline" size="sm" className="flex-1 h-9" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button size="sm" className="flex-1 h-9" onClick={() => { onConfirmar(); setPagado(true); }}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar pago
          </Button>
        </div>
      </div>
    </div>
  );
}

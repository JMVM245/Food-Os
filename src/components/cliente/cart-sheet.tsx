"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore, type TipoEntrega, type ItemCarrito, HORAS_DEL_DIA, MAX_PEDIDOS_POR_FRANJA } from "@/store/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, Armchair, Store, Clock, Users, Zap, CreditCard, CheckCircle2, X } from "lucide-react";
import { COMBOS_INICIALES, TIENDAS } from "@/lib/data";
import { formatoCOP } from "./product-card";
import "./cart-sheet.css";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const router = useRouter();

  const asiento = useStore((s) => s.asiento);
  const carrito = useStore((s) => s.carrito);
  const productos = useStore((s) => s.productos);
  const tipoEntrega = useStore((s) => s.tipoEntrega);
  const setTipoEntrega = useStore((s) => s.setTipoEntrega);
  const tiendaActiva = useStore((s) => s.tiendaActiva);
  const setTiendaActiva = useStore((s) => s.setTiendaActiva);
  const setCantidad = useStore((s) => s.setCantidad);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const crearPedido = useStore((s) => s.crearPedido);
  const disponibleEnFranja = useStore((s) => s.disponibleEnFranja);

  const precioUnitario = (c: ItemCarrito & { producto: (typeof productos)[number]; variante?: { id: string; nombre: string; precioExtra: number } }) => {
    return c.producto.precio + (c.variante?.precioExtra ?? 0);
  };

  const items = carrito
    .map((c) => {
      const producto = productos.find((p) => p.id === c.productoId);
      if (!producto) return null;
      const v = c.varianteId ? producto.variantes?.find((v) => v.id === c.varianteId) : undefined;
      return { ...c, producto, variante: v };
    })
    .filter(Boolean) as (ItemCarrito & { producto: (typeof productos)[number]; variante?: { id: string; nombre: string; precioExtra: number } })[];

  const comboMap = new Map<string, (typeof items)[number][]>();
  for (const item of items) {
    if (item.comboId) {
      const arr = comboMap.get(item.comboId) ?? [];
      arr.push(item);
      comboMap.set(item.comboId, arr);
    }
  }

  const precioEfectivo = (item: (typeof items)[number]) => {
    if (!item.comboId) return precioUnitario(item);
    const grupo = comboMap.get(item.comboId);
    if (!grupo) return precioUnitario(item);
    const comboDef = COMBOS_INICIALES.find((c) => c.id === item.comboId);
    if (!comboDef) return precioUnitario(item);
    const totalNormal = grupo.reduce((acc, i) => acc + precioUnitario(i) * i.cantidad, 0);
    const ratio = totalNormal > 0 ? comboDef.precioCombo / totalNormal : 1;
    return Math.round(precioUnitario(item) * ratio);
  };

  const total = items.reduce((acc, i) => acc + precioEfectivo(i) * i.cantidad, 0);
  const asientoCompleto = Boolean(asiento.tribuna);

  const zona = tipoEntrega === "delivery" ? asiento.tribuna : null;

  function handlePagar() {
    setError(null);
    if (tipoEntrega === "delivery" && !asientoCompleto) {
      setError("Selecciona tribuna, fila y silla antes de pagar.");
      return;
    }
    if (tipoEntrega === "delivery" && !horaSeleccionada) {
      setError("Selecciona una hora de entrega.");
      return;
    }
    setMostrarPago(true);
  }

  function crearPedidoDespuesDePagar() {
    setPagando(true);
    const pedidoId = crearPedido(tipoEntrega === "delivery" ? horaSeleccionada! : undefined);
    setPagando(false);
    if (!pedidoId) {
      setError(tipoEntrega === "delivery" && horaSeleccionada
        ? "Esta franja horaria se llenó. Elige otra hora."
        : "No hay stock suficiente para uno de tus productos. Ajusta las cantidades.");
      setMostrarPago(false);
      return;
    }
    setOpen(false);
    setMostrarPago(false);
    router.push(`/seguimiento/${pedidoId}`);
  }

  const opcionesEntrega: { value: TipoEntrega; label: string; icon: typeof Armchair }[] = [
    { value: "delivery", label: "En el punto más cercano a ti", icon: Armchair },
    { value: "pickup", label: "Recoger en tienda", icon: Store },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="pitch" className="cart-trigger">
          <ShoppingCart className="h-4 w-4" />
          Carrito
          {carrito.length > 0 && (
            <span className="cart-badge">
              {carrito.reduce((a, i) => a + i.cantidad, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="cart-sheet-title">
            <ShoppingCart className="cart-sheet-icon" />
            Tu pedido
          </SheetTitle>
          <SheetDescription>
            {tipoEntrega === "delivery"
              ? asientoCompleto
                ? `Se entrega en ${asiento.tribuna}`
                : "Selecciona tu ubicación para recibir el pedido."
              : `Recoge en Tienda ${tiendaActiva}.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart className="cart-empty-icon" />
              <p className="cart-empty-text">Tu carrito está vacío. Agrega algo del menú.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-md border border-border bg-card p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ¿Cómo quieres recibirlo?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {opcionesEntrega.map((op) => {
                    const Icon = op.icon;
                    const activo = tipoEntrega === op.value;
                    return (
                      <button
                        key={op.value}
                        onClick={() => { setTipoEntrega(op.value); setHoraSeleccionada(null); }}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                          activo
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{op.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {tipoEntrega === "pickup" && (
                <div className="mb-4 rounded-md border border-border bg-card p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ¿En qué tienda recoges?
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    {TIENDAS.map((t) => {
                      const activa = tiendaActiva === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setTiendaActiva(t)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                            activa
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Store className="h-4 w-4 shrink-0" />
                          <span className="truncate">Tienda {t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tipoEntrega === "delivery" && asientoCompleto && zona && (
                <div className="mb-4 rounded-md border border-border bg-card p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Elige la hora de entrega
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Máximo {MAX_PEDIDOS_POR_FRANJA} pedidos por hora en Zona {zona}.
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {HORAS_DEL_DIA.map((h) => {
                      const disp = disponibleEnFranja(h, zona);
                      const llena = disp <= 0;
                      const activa = horaSeleccionada === h;
                      return (
                        <button
                          key={h}
                          disabled={llena}
                          onClick={() => setHoraSeleccionada(h)}
                          className={`flex flex-col items-center rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                            activa
                              ? "bg-accent text-accent-foreground"
                              : llena
                                ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                          }`}
                        >
                          <span>{h}</span>
                          <span className={`text-[9px] mt-0.5 ${activa ? "text-accent-foreground/70" : "text-muted-foreground/60"}`}>
                            <Users className="inline h-2.5 w-2.5 mr-0.5" />
                            {disp}/{MAX_PEDIDOS_POR_FRANJA}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {horaSeleccionada && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge variant="success" className="text-[10px] h-5">
                        {horaSeleccionada} — {disponibleEnFranja(horaSeleccionada, zona)} disponibles
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <ul className="cart-items">
                {items.map((item) => {
                  const { productoId, cantidad, producto, variante, comboId } = item;
                  const key = productoId + (variante?.id ?? "") + (comboId ?? "");
                  const unitario = precioEfectivo(item);
                  const comboDef = comboId ? COMBOS_INICIALES.find((c) => c.id === comboId) : undefined;
                  return (
                    <li key={key} className="cart-item">
                      <div className="cart-item-emoji">
                        {producto.emoji}
                      </div>
                      <div className="cart-item-info">
                        <p className="cart-item-name">{producto.nombre}</p>
                        {variante && (
                          <p className="text-[11px] text-muted-foreground">{variante.nombre}</p>
                        )}
                        {comboDef && (
                          <p className="flex items-center gap-1 text-[10px] font-semibold text-accent">
                            <Zap className="h-3 w-3" /> {comboDef.nombre}
                          </p>
                        )}
                        <p className="cart-item-price">{formatoCOP.format(unitario)}</p>
                      </div>
                      <div className="cart-item-actions">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setCantidad(productoId, cantidad - 1, variante?.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="cart-item-qty">{cantidad}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setCantidad(productoId, cantidad + 1, variante?.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(productoId, variante?.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Separator className="my-4" />

              <div className="cart-total mb-4">
                <span className="cart-total-label">Total</span>
                <span className="cart-total-value">{formatoCOP.format(total)}</span>
              </div>
            </>
          )}
        </div>

        <SheetFooter>
          {error && (
            <p className="cart-error">{error}</p>
          )}
          <Separator />
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0 || pagando}
            onClick={handlePagar}
          >
            <ShoppingCart className="h-4 w-4" />
            {pagando ? "Procesando…" : "Ir a pagar"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {mostrarPago && (
        <PagoObligatorioModal
          total={total}
          items={items.map((i) => ({
            nombre: i.producto.nombre,
            emoji: i.producto.emoji,
            cantidad: i.cantidad,
            precio: precioEfectivo(i),
            variante: i.variante?.nombre,
          }))}
          onConfirmar={crearPedidoDespuesDePagar}
          onCerrar={() => setMostrarPago(false)}
        />
      )}
    </Sheet>
  );
}

function PagoObligatorioModal({
  total, items, onConfirmar, onCerrar,
}: {
  total: number;
  items: { nombre: string; emoji: string; cantidad: number; precio: number; variante?: string }[];
  onConfirmar: () => void;
  onCerrar: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pagado, setPagado] = useState(false);
  const ref = useRef(`CLIENTE-${Date.now().toString(36).toUpperCase()}`).current;

  useEffect(() => {
    import("qrcode").then((mod) => {
      mod.default.toDataURL(
        `fifa-delivery://pago?total=${total}&ref=${ref}`,
        { width: 240, margin: 2, color: { dark: "#1a1a2e", light: "#ffffff" } },
        (err, url) => { if (!err) setQrDataUrl(url); }
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pagado) {
    return (
      <div className="cart-pago-overlay">
        <div className="cart-pago-modal">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-pitch-bright/15">
              <CheckCircle2 className="h-8 w-8 text-pitch-bright" />
            </div>
            <h2 className="font-display text-xl font-black uppercase text-pitch-bright">¡Pago exitoso!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Tu pedido quedó pagado por anticipado.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Ref: {ref}
            </p>
            <Button size="sm" className="mt-2 h-9" onClick={onConfirmar}>
              Continuar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-pago-overlay">
      <div className="cart-pago-modal">
        <button className="cart-pago-close" onClick={onCerrar}>
          <X className="h-4 w-4" />
        </button>

        <div className="cart-pago-header">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/15">
            <CreditCard className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="cart-pago-label">Pago obligatorio</p>
            <h2 className="cart-pago-title">Paga para confirmar</h2>
          </div>
        </div>

        <div className="cart-pago-body">
          <div className="cart-pago-code">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR de pago" className="cart-pago-img" />
            ) : (
              <div className="cart-pago-loading">Generando QR...</div>
            )}
          </div>

          <div className="cart-pago-items">
            {items.map((item, idx) => (
              <div key={idx} className="cart-pago-item">
                <span className="cart-pago-item-name">
                  {item.emoji} {item.nombre} ×{item.cantidad}
                  {item.variante && <span className="block text-[10px] text-muted-foreground">{item.variante}</span>}
                </span>
                <span className="font-mono shrink-0">{formatoCOP.format(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="cart-pago-total">
            <span>Total</span>
            <span className="font-display font-bold text-gold">{formatoCOP.format(total)}</span>
          </div>

          <p className="cart-pago-ref">
            Referencia: <span className="font-mono">{ref}</span>
          </p>
        </div>

        <div className="cart-pago-actions">
          <Button variant="outline" size="sm" className="flex-1 h-9" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button size="sm" className="flex-1 h-9" onClick={() => setPagado(true)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar pago
          </Button>
        </div>
      </div>
    </div>
  );
}

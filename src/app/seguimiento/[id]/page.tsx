"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import type { ItemPedido } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EncuestaSatisfaccion } from "@/components/encuesta/encuesta-satisfaccion";
import { CheckCircle2, Truck, Bell, Store, ArrowLeft, RotateCcw, Pencil, X, Minus, Plus, ShieldCheck } from "lucide-react";
import { formatoCOP } from "@/components/cliente/product-card";
import "../seguimiento.css";

export default function SeguimientoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const addToCart = useStore((s) => s.addToCart);
  const updatePedidoItems = useStore((s) => s.updatePedidoItems);
  const marcarEntregado = useStore((s) => s.marcarEntregado);
  const [ahora, setAhora] = useState(() => Date.now());
  const [editando, setEditando] = useState(false);
  const [editItems, setEditItems] = useState<ItemPedido[]>([]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (pedido && editando && editItems.length === 0) {
      setEditItems(pedido.items.map((i) => ({ ...i })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando]);

  if (!pedido) {
    return (
      <main className="seguimiento-not-found">
        <p className="seguimiento-not-found-title">Pedido no encontrado</p>
        <p className="seguimiento-not-found-desc">
          Puede que el enlace sea incorrecto o el pedido ya no exista en este dispositivo.
        </p>
        <Button asChild variant="secondary">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Volver al menÃº
          </Link>
        </Button>
      </main>
    );
  }

  const entregado = pedido.estado === "entregado";
  const notificado = pedido.estado === "notificado";
  const cancelable = pedido.estado === "en_camino" || pedido.estado === "preparando";
  const totalMs = pedido.tiempoEstimadoMin * 60_000;
  const elapsedMs = ahora - pedido.creadoEn;
  const progreso = entregado
    ? 100
    : pedido.pagado
      ? Math.min(96, (elapsedMs / totalMs) * 100)
      : 0;
  const restanteMin = entregado
    ? 0
    : pedido.pagado
      ? Math.max(0, Math.ceil((totalMs - elapsedMs) / 60_000))
      : null;

  function handleGuardarEdicion() {
    if (!pedido) return;
    const validos = editItems.filter((i) => i.cantidad > 0);
    if (validos.length === 0) return;
    updatePedidoItems(pedido.id, validos);
    setEditando(false);
  }

  function handleEditCant(idx: number, delta: number) {
    setEditItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item))
    );
  }

  function handleEditRemove(idx: number) {
    setEditItems((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <main className="seguimiento-main">
      <Link href="/" className="seguimiento-back">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver al menÃº
      </Link>

      <Card className="seguimiento-card">
        <div className="seguimiento-header">
          <p className="seguimiento-ticket">Ticket #{pedido.id}</p>
          {entregado ? (
            <div className="seguimiento-status">
              <CheckCircle2 className="seguimiento-status-icon !text-pitch-bright" />
              <p className="seguimiento-status-text !text-pitch-bright">Â¡Pedido entregado!</p>
            </div>
          ) : notificado ? (
            <div className="seguimiento-status">
              <Bell className="seguimiento-status-icon !text-amber-400 animate-pulse" />
              <p className="seguimiento-status-text !text-amber-400">Â¡El repartidor ya estÃ¡ en tu zona!</p>
            </div>
          ) : pedido.estado === "preparando" ? (
            <div className="seguimiento-status">
              <Store className="seguimiento-status-icon !text-accent" />
              <p className="seguimiento-status-text">Preparando tu pedido</p>
            </div>
          ) : (
            <div className="seguimiento-status">
              <Truck className="seguimiento-status-icon animate-pulse-dot !text-accent" />
              <p className="seguimiento-status-text">Tu pedido va en camino</p>
            </div>
          )}
        </div>

        <CardContent className="seguimiento-body">
          <div className="seguimiento-vendedor">
            <div className="min-w-0">
              <p className="seguimiento-vendedor-label">Repartidor asignado</p>
              <p className="seguimiento-vendedor-name">
                {pedido.vendedor.nombre}{" "}
                <span className="seguimiento-vendedor-code">#{pedido.vendedor.codigo}</span>
              </p>
            </div>
            <Badge variant={entregado ? "success" : notificado ? "warning" : "secondary"} className="shrink-0">
              {entregado ? "Entregado" : notificado ? "En zona" : pedido.estado === "preparando" ? "Preparando" : "En camino"}
            </Badge>
          </div>

          <div>
            <div className="seguimiento-progress">
              <span>Progreso de entrega</span>
              <span className="seguimiento-progress-time">
                {entregado ? "Listo" : restanteMin === null ? "Esperando pago" : `Tiempo: ${restanteMin} min`}
              </span>
            </div>
            <Progress value={progreso} />
          </div>

          <Separator />

          <div>
            <p className="seguimiento-direccion-label">
              {pedido.tipoEntrega === "pickup" ? "Recoger en" : "Entregar en"}
            </p>
            <p className="seguimiento-direccion">
              {pedido.tipoEntrega === "pickup"
                ? `Punto de venta Â· Zona ${pedido.tribuna}`
                : pedido.tribuna}
            </p>
            {pedido.codigoBoleta && (
              <p className="text-[11px] text-muted-foreground mt-0.5">CÃ³digo boleta: {pedido.codigoBoleta}</p>
            )}
          </div>

          <Separator />

          <div className="seguimiento-items">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Productos</p>
              {cancelable && !editando && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditando(true)}>
                  <Pencil className="h-3 w-3" /> Editar
                </Button>
              )}
              {editando && (
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleGuardarEdicion}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditando(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            {(editando ? editItems : pedido.items).map((item, idx) => (
              <div key={item.productoId + (item.variante?.id ?? "") + idx} className="seguimiento-item">
                <span className="seguimiento-item-name">
                  <span className="block truncate">{item.emoji} {item.cantidad}x {item.nombre}</span>
                  {item.variante && <span className="block text-[11px] text-muted-foreground">{item.variante.nombre}</span>}
                </span>
                <span className="seguimiento-item-price shrink-0">
                  {formatoCOP.format(item.precio * item.cantidad)}
                </span>
                {editando && (
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditCant(idx, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-xs font-mono">{item.cantidad}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEditCant(idx, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleEditRemove(idx)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {pedido.pagado && (
            <div className="seguimiento-pagado">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <p className="seguimiento-pagado-title">PAGADO</p>
                <p className="seguimiento-pagado-desc">Pagado. Solo recibe tu pedido.</p>
              </div>
            </div>
          )}

          <div className="seguimiento-total">
            <span className="seguimiento-total-label">Total {editando ? "ajustado" : "pagado"}</span>
            <span className="seguimiento-total-value">
              {formatoCOP.format(
                editando ? editItems.reduce((acc, i) => acc + i.precio * i.cantidad, 0) : pedido.total
              )}
            </span>
          </div>

          {(pedido.estado === "en_camino" || notificado) && !editando && (
            <>
              <Separator />
              <Button
                variant="pitch"
                size="sm"
                className="w-full"
                onClick={() => marcarEntregado(pedido.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Marcar como recibido
              </Button>
            </>
          )}

          </CardContent>
        </Card>

      {entregado && (
        <div className="mt-6 space-y-4">
          <EncuestaSatisfaccion pedidoId={pedido.id} />
          <Button variant="outline" className="w-full" onClick={() => {
            pedido.items.forEach((item) => addToCart(item.productoId, item.variante?.id));
            router.push("/");
          }}>
            <RotateCcw className="h-4 w-4" />
            Pedir de nuevo
          </Button>
        </div>
      )}
    </main>
  );
}

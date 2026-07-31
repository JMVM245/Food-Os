"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/store/store";
import { ZONAS, type Zona, type PuntoRecoleccion } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ControlIngreso } from "@/components/vendedor/control-ingreso";
import { formatoCOP } from "@/components/cliente/product-card";
import {
  Package,
  CheckCircle2,
  LogOut,
  Armchair,
  Store,
  QrCode,
  X,
  MapPin,
  Users,
  ChevronRight,
  Clock,
  ShoppingBag,
} from "lucide-react";
import "./vendedor.css";

const ZONA_COLORS: Record<Zona, { bg: string; border: string; text: string; badge: string }> = {
  Norte: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300" },
  Sur: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  Oriental: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
  Occidental: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300" },
};

export default function VendedorPage() {
  const puntoActivo = useStore((s) => s.puntoActivo);
  const setPuntoActivo = useStore((s) => s.setPuntoActivo);

  if (!puntoActivo) {
    return <LoginPunto onSelect={setPuntoActivo} />;
  }

  return (
    <ListaPedidos
      zona={puntoActivo.zona}
      punto={puntoActivo}
      onSalir={() => setPuntoActivo(null)}
    />
  );
}

function LoginPunto({ onSelect }: { onSelect: (p: PuntoRecoleccion) => void }) {
  const puntos = useStore((s) => s.puntosRecoleccion);
  const pedidos = useStore((s) => s.pedidos);
  const [zonaFilter, setZonaFilter] = useState<Zona | null>(null);

  const zonasAMostrar: Zona[] = zonaFilter ? [zonaFilter] : ZONAS;

  const pendientesPorZona = useMemo(() => {
    const m = new Map<Zona, number>();
    for (const z of ZONAS) m.set(z, pedidos.filter((p) => p.zona === z && (p.estado === "en_camino" || p.estado === "notificado") && p.tipoEntrega === "delivery").length);
    return m;
  }, [pedidos]);

  return (
    <main className="vendedor-login-main">
      <div className="vendedor-login-header">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-accent" />
          <p className="vendedor-login-badge">Acceso Punto de Recolección</p>
        </div>
        <h1 className="vendedor-login-title">Selecciona tu punto</h1>
        <p className="vendedor-login-desc">
          Elige el punto de recolección donde estás ubicado para gestionar los pedidos.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6 px-1">
        <Button
          size="sm"
          variant={zonaFilter === null ? "default" : "ghost"}
          onClick={() => setZonaFilter(null)}
          className="h-8 text-xs"
        >
          Todas
        </Button>
        {ZONAS.map((z) => (
          <Button
            key={z}
            size="sm"
            variant={zonaFilter === z ? "default" : "ghost"}
            onClick={() => setZonaFilter(z)}
            className={`h-8 text-xs ${zonaFilter === z ? "" : ZONA_COLORS[z].text}`}
          >
            {z}
          </Button>
        ))}
      </div>

      <div className="vendedor-login-list">
        {zonasAMostrar.map((z) => {
          const deEstaZona = puntos.filter((p) => p.zona === z);
          const pendientes = pendientesPorZona.get(z) ?? 0;
          const color = ZONA_COLORS[z];
          return (
            <div key={z}>
              <div className={`flex items-center justify-between rounded-lg px-4 py-2 mb-2 ${color.bg} ${color.border} border`}>
                <div className="flex items-center gap-2">
                  <Users className={`h-4 w-4 ${color.text}`} />
                  <span className={`font-bold text-sm ${color.text}`}>Zona {z}</span>
                  <span className="text-xs text-muted-foreground">· {deEstaZona.length} puntos</span>
                </div>
                {pendientes > 0 && (
                  <Badge variant="warning" className="text-[10px] h-5">
                    {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {deEstaZona.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className={`vendedor-login-btn ${color.border}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`vendedor-login-icon ${color.bg}`}>
                        <MapPin className={`h-5 w-5 ${color.text}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="vendedor-login-zona truncate">{p.nombre}</p>
                        <p className="vendedor-login-vendedor truncate">
                          <span className="font-mono">{p.codigo}</span>
                          <span className="mx-1.5">·</span>
                          {p.encargado}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function ListaPedidos({ zona, punto, onSalir }: { zona: Zona; punto: PuntoRecoleccion; onSalir: () => void }) {
  const pedidos = useStore((s) => s.pedidos);
  const marcarEntregado = useStore((s) => s.marcarEntregado);
  const notificarCliente = useStore((s) => s.notificarCliente);
  const [qrPedidoId, setQrPedidoId] = useState<string | null>(null);

  const pendientes = useMemo(
    () =>
      pedidos
        .filter((p) => p.zona === zona && (p.estado === "en_camino" || p.estado === "notificado") && p.tipoEntrega === "delivery")
        .sort((a, b) => a.creadoEn - b.creadoEn),
    [pedidos, zona]
  );
  const entregadosHoy = pedidos.filter((p) => p.zona === zona && p.estado === "entregado").length;
  const color = ZONA_COLORS[zona];

  return (
    <main className="vendedor-list-main">
      <header className="vendedor-list-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color.bg}`}>
            <MapPin className={`h-5 w-5 ${color.text}`} />
          </div>
          <div className="min-w-0">
            <p className="vendedor-list-info">{punto.nombre} · <span className="font-mono">{punto.codigo}</span></p>
            <h1 className="vendedor-list-title">Zona {zona}</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">{punto.encargado}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSalir}>
            <LogOut className="h-3.5 w-3.5" /> Cambiar punto
          </Button>
        </div>
      </header>

      <div className="mb-5">
        <ControlIngreso zona={zona} />
      </div>

      <div className="vendedor-kpi-grid">
        <Card>
          <CardContent className="vendedor-kpi-card">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color.bg}`}>
              <ShoppingBag className={`h-5 w-5 ${color.text}`} />
            </div>
            <div>
              <p className="vendedor-kpi-number">{pendientes.length}</p>
              <p className="vendedor-kpi-label">Por entregar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="vendedor-kpi-card">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pitch-bright/15">
              <CheckCircle2 className="h-5 w-5 text-pitch-bright" />
            </div>
            <div>
              <p className="vendedor-kpi-number">{entregadosHoy}</p>
              <p className="vendedor-kpi-label">Entregados hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendientes.length === 0 ? (
        <div className="vendedor-empty">
          <Package className="vendedor-empty-icon" />
          <p className="vendedor-empty-text">No hay pedidos pendientes en tu zona por ahora.</p>
          {entregadosHoy > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Llevas {entregadosHoy} entregado{entregadosHoy !== 1 ? "s" : ""} hoy.</p>
          )}
        </div>
      ) : (
        <ul className="vendedor-pedidos-list">
          {pendientes.map((pedido) => (
            <Card key={pedido.id} className="overflow-hidden">
              <div className={`h-1 ${color.bg}`} />
              <CardHeader className="vendedor-card-header">
                <CardTitle className="vendedor-card-title">
                  {pedido.tipoEntrega === "pickup" ? (
                    <Store className="vendedor-card-location" />
                  ) : (
                    <Armchair className="vendedor-card-location" />
                  )}
                  <div className="flex flex-col">
                    <span>
                      {pedido.tipoEntrega === "pickup"
                        ? "Recoger en tienda"
                        : `${pedido.tribuna}`}
                    </span>
                    {pedido.codigoBoleta && (
                      <span className="text-[10px] font-normal text-muted-foreground">
                        Boleta: {pedido.codigoBoleta}
                      </span>
                    )}
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor((Date.now() - pedido.creadoEn) / 60000)} min
                  </div>
                  <Badge variant={pedido.tipoEntrega === "pickup" ? "outline" : "warning"}>
                    {pedido.tipoEntrega === "pickup" ? "RECOGER" : `#${pedido.id}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="vendedor-card-items">
                  {pedido.items.map((item, idx) => (
                    <div key={item.productoId + (item.variante?.id ?? "") + idx} className="vendedor-card-item">
                      <span className="flex flex-col">
                        <span><span className="text-base">{item.emoji}</span> {item.cantidad}x {item.nombre}</span>
                        {item.variante && (
                          <span className="text-[11px] text-muted-foreground">{item.variante.nombre}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
                <div className="vendedor-card-footer">
                  <span className="vendedor-card-total">
                    {formatoCOP.format(pedido.total)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {pedido.estado === "en_camino" && (
                      <Button size="sm" variant="default" className="h-8 text-xs" onClick={() => notificarCliente(pedido.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Llegué a la zona
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setQrPedidoId(qrPedidoId === pedido.id ? null : pedido.id)}>
                      <QrCode className="h-3.5 w-3.5" />
                      QR
                    </Button>
                    <Button size="sm" variant="pitch" className="h-8 text-xs" onClick={() => marcarEntregado(pedido.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Entregar
                    </Button>
                  </div>
                </div>
                {qrPedidoId === pedido.id && (
                  <div className="mt-3 flex flex-col items-center gap-2 rounded-md border border-border bg-card p-4">
                    <div className="flex w-full items-center justify-between">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Cobro QR — #{pedido.id}</p>
                      <button onClick={() => setQrPedidoId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid h-44 w-44 place-items-center rounded-lg bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FOODOS:${pedido.total}:${pedido.tribuna}`}
                        alt="QR de cobro"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Muestra este código al cliente para cobrar <span className="font-bold text-gold">{formatoCOP.format(pedido.total)}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </main>
  );
}

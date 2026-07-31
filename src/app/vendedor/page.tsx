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
  MapPin,
  Clock,
  ShoppingBag,
  ShieldCheck,
  Hand,
} from "lucide-react";
import "./vendedor.css";

const ZONA_COLORS: Record<Zona, { bg: string; border: string; text: string; badge: string }> = {
  Norte: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500/20 text-blue-300" },
  Sur: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-300" },
  Oriental: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-300" },
  Occidental: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", badge: "bg-purple-500/20 text-purple-300" },
};

export default function VendedorPage() {
  const sesion = useStore((s) => s.repartidorSesion);
  const logoutRepartidor = useStore((s) => s.logoutRepartidor);
  const puntos = useStore((s) => s.puntosRecoleccion);

  if (!sesion) {
    return <AuthRepartidor />;
  }

  const punto = puntos.find((p) => p.id === sesion.puntoId);
  if (!punto) {
    return <AuthRepartidor />;
  }

  return (
    <ListaPedidos
      zona={punto.zona}
      punto={punto}
      repartidor={{ nombre: sesion.nombre, codigo: sesion.codigo }}
      onSalir={logoutRepartidor}
    />
  );
}

function AuthRepartidor() {
  const registrarRepartidor = useStore((s) => s.registrarRepartidor);
  const loginRepartidor = useStore((s) => s.loginRepartidor);
  const puntos = useStore((s) => s.puntosRecoleccion);
  const [modo, setModo] = useState<"registrar" | "ingresar">("registrar");
  const [zona, setZona] = useState<Zona | null>(null);
  const [puntoId, setPuntoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");

  const puntosDeZona = zona ? puntos.filter((p) => p.zona === zona) : [];

  function handleRegistrar() {
    if (!puntoId) return setError("Selecciona tu punto de recolección.");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (password.length < 4) return setError("La contraseña debe tener al menos 4 caracteres.");
    if (password !== confirmar) return setError("Las contraseñas no coinciden.");
    const punto = puntos.find((p) => p.id === puntoId);
    if (!punto) return setError("Punto no encontrado.");
    const res = registrarRepartidor({ nombre: nombre.trim(), password, puntoId, zona: punto.zona });
    if (!res.ok) return setError(res.error ?? "No se pudo registrar.");
  }

  function handleIngresar() {
    if (!codigo.trim()) return setError("Escribe el código de tu punto.");
    if (!password) return setError("Escribe tu contraseña.");
    const res = loginRepartidor(codigo.trim(), password);
    if (!res.ok) return setError(res.error ?? "No se pudo iniciar sesión.");
  }

  return (
    <main className="vendedor-login-main">
      <div className="vendedor-login-header">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-accent" />
          <p className="vendedor-login-badge">Acceso Repartidor</p>
        </div>
        <h1 className="vendedor-login-title">
          {modo === "registrar" ? "Regístrate como repartidor" : "Ingresa a tu punto"}
        </h1>
        <p className="vendedor-login-desc">
          Debes registrarte e iniciar sesión para reclamar y entregar pedidos.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6 px-1">
        <Button size="sm" variant={modo === "registrar" ? "default" : "ghost"} className="h-8 text-xs" onClick={() => { setModo("registrar"); setError(""); }}>
          Registrar
        </Button>
        <Button size="sm" variant={modo === "ingresar" ? "default" : "ghost"} className="h-8 text-xs" onClick={() => { setModo("ingresar"); setError(""); }}>
          Ya tengo cuenta
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="vendedor-login-list">
        {modo === "registrar" ? (
          <>
            <div>
              <p className="vendedor-auth-label">1. Elige tu zona</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ZONAS.map((z) => (
                  <Button
                    key={z}
                    size="sm"
                    variant={zona === z ? "default" : "ghost"}
                    className={`h-8 text-xs ${zona === z ? "" : ZONA_COLORS[z].text}`}
                    onClick={() => { setZona(z); setPuntoId(""); }}
                  >
                    {z}
                  </Button>
                ))}
              </div>
            </div>

            {zona && (
              <div>
                <p className="vendedor-auth-label">2. Elige tu punto</p>
                <div className="vendedor-auth-puntos mt-1">
                  {puntosDeZona.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPuntoId(p.id)}
                      className={`vendedor-auth-punto ${puntoId === p.id ? "vendedor-auth-punto-activo" : ""}`}
                    >
                      <span className="font-mono text-xs">{p.codigo}</span>
                      <span className="truncate">{p.nombre}</span>
                      <span className="text-[10px] text-muted-foreground">{p.encargado}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div>
                <p className="vendedor-auth-label">Tu nombre</p>
                <input
                  className="vendedor-auth-input"
                  placeholder="Ej: Carlos Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div>
                <p className="vendedor-auth-label">Contraseña</p>
                <input
                  type="password"
                  className="vendedor-auth-input"
                  placeholder="Mínimo 4 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <p className="vendedor-auth-label">Confirmar contraseña</p>
                <input
                  type="password"
                  className="vendedor-auth-input"
                  placeholder="Repite la contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full h-10" onClick={handleRegistrar}>
              <Hand className="h-4 w-4" /> Crear cuenta y entrar
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div>
                <p className="vendedor-auth-label">Código de punto</p>
                <input
                  className="vendedor-auth-input font-mono"
                  placeholder="Ej: N-P01"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
              <div>
                <p className="vendedor-auth-label">Contraseña</p>
                <input
                  type="password"
                  className="vendedor-auth-input"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full h-10" onClick={handleIngresar}>
              <CheckCircle2 className="h-4 w-4" /> Iniciar sesión
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

function ListaPedidos({ zona, punto, repartidor, onSalir }: { zona: Zona; punto: PuntoRecoleccion; repartidor: { nombre: string; codigo: string }; onSalir: () => void }) {
  const pedidos = useStore((s) => s.pedidos);
  const marcarEntregado = useStore((s) => s.marcarEntregado);
  const notificarCliente = useStore((s) => s.notificarCliente);
  const reclamarPedido = useStore((s) => s.reclamarPedido);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const disponibles = useMemo(
    () =>
      pedidos
        .filter((p) => p.zona === zona && p.tipoEntrega === "delivery" && p.estado === "reclamo")
        .sort((a, b) => a.creadoEn - b.creadoEn),
    [pedidos, zona]
  );

  const misEntregas = useMemo(
    () =>
      pedidos
        .filter(
          (p) =>
            p.zona === zona &&
            p.tipoEntrega === "delivery" &&
            p.vendedor?.codigo === punto.codigo &&
            (p.estado === "en_camino" || p.estado === "notificado")
        )
        .sort((a, b) => a.creadoEn - b.creadoEn),
    [pedidos, zona, punto.codigo]
  );

  const entregadosHoy = pedidos.filter((p) => p.zona === zona && p.estado === "entregado").length;
  const color = ZONA_COLORS[zona];

  function handleReclamar(pedidoId: string) {
    const ok = reclamarPedido(pedidoId, { nombre: repartidor.nombre, codigo: repartidor.codigo });
    if (!ok) {
      setMensaje("Otro repartidor se llevó este pedido.");
      window.setTimeout(() => setMensaje(null), 3000);
    }
  }

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
            <p className="text-[11px] text-muted-foreground mt-0.5">{repartidor.nombre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSalir}>
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
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
              <Hand className={`h-5 w-5 ${color.text}`} />
            </div>
            <div>
              <p className="vendedor-kpi-number">{disponibles.length}</p>
              <p className="vendedor-kpi-label">Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="vendedor-kpi-card">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${color.bg}`}>
              <ShoppingBag className={`h-5 w-5 ${color.text}`} />
            </div>
            <div>
              <p className="vendedor-kpi-number">{misEntregas.length}</p>
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

      {mensaje && (
        <div className="mb-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {mensaje}
        </div>
      )}

      {disponibles.length > 0 && (
        <section className="mb-6">
          <h2 className="vendedor-section-title">
            <Hand className="h-4 w-4 text-accent" /> Pedidos para reclamar
          </h2>
          <ul className="vendedor-pedidos-list">
            {disponibles.map((pedido) => (
              <Card key={pedido.id} className="overflow-hidden">
                <div className={`h-1 ${color.bg}`} />
                <CardHeader className="vendedor-card-header">
                  <CardTitle className="vendedor-card-title">
                    <Armchair className="vendedor-card-location" />
                    <div className="flex flex-col">
                      <span>{pedido.tribuna}</span>
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
                    <Badge variant="warning">
                      <Hand className="h-3 w-3 mr-0.5" /> DISPONIBLE
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
                    <Button size="sm" variant="default" className="h-9 text-xs" onClick={() => handleReclamar(pedido.id)}>
                      <Hand className="h-4 w-4" />
                      Yo lo entrego
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        </section>
      )}

      {misEntregas.length > 0 && (
        <section className="mb-6">
          <h2 className="vendedor-section-title">
            <Package className="h-4 w-4 text-accent" /> Mis entregas
          </h2>
          <ul className="vendedor-pedidos-list">
            {misEntregas.map((pedido) => (
              <Card key={pedido.id} className="overflow-hidden">
                <div className={`h-1 ${color.bg}`} />
                <CardHeader className="vendedor-card-header">
                  <CardTitle className="vendedor-card-title">
                    <Armchair className="vendedor-card-location" />
                    <div className="flex flex-col">
                      <span>{pedido.tribuna}</span>
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
                    {pedido.pagado && (
                      <Badge variant="success">
                        <ShieldCheck className="h-3 w-3 mr-0.5" /> PAGADO
                      </Badge>
                    )}
                    <Badge variant="outline">
                      #{pedido.id}
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
                      <Button size="sm" variant="pitch" className="h-8 text-xs" onClick={() => marcarEntregado(pedido.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Entregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        </section>
      )}

      {disponibles.length === 0 && misEntregas.length === 0 && (
        <div className="vendedor-empty">
          <Package className="vendedor-empty-icon" />
          <p className="vendedor-empty-text">No hay pedidos pendientes en tu zona por ahora.</p>
          {entregadosHoy > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Llevas {entregadosHoy} entregado{entregadosHoy !== 1 ? "s" : ""} hoy.</p>
          )}
        </div>
      )}
    </main>
  );
}

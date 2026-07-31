"use client";

import { useMemo, lazy, Suspense, useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { ZONAS, type Zona } from "@/lib/data";
import { HORAS_DEL_DIA, MAX_PEDIDOS_POR_FRANJA } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Timer,
  AlertTriangle,
  Package,
  RotateCcw,
  Plus,
  Receipt,
  Download,
  FlaskConical,
  Edit3,
  Trash2,
  Check,
  X,
  MapPin,
  Play,
  Square,
  Coffee,
  Clock,
} from "lucide-react";
import "./admin.css";

const COLORES = ["#F2B705", "#2F9E44", "#E63946", "#4E9CD8", "#B569D8"];

const GraficaTop = lazy(() => import("@/components/admin/grafica-top"));

interface MateriaPrima {
  id_materia_prima: number;
  nombre: string;
  categoria: string | null;
  unidad_medida: string;
  stock_disponible: number;
  stock_norte: number;
  stock_sur: number;
  stock_oriental: number;
  stock_occidental: number;
  stock_maximo: number;
  umbral_alerta_pct: number;
  costo_unitario: number;
  fecha_actualizacion: string | null;
}

export default function AdminPage() {
  const pedidos = useStore((s) => s.pedidos);
  const resetDemo = useStore((s) => s.resetDemo);
  const puntosRecoleccion = useStore((s) => s.puntosRecoleccion);
  const partido = useStore((s) => s.partido);
  const iniciarPartido = useStore((s) => s.iniciarPartido);
  const setMedioTiempo = useStore((s) => s.setMedioTiempo);
  const finalizarPartido = useStore((s) => s.finalizarPartido);
  const franjasOcupadas = useStore((s) => s.franjasOcupadas);

  const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00");

  const [materias, setMaterias] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    categoria: "",
    unidad_medida: "unidad",
    stock_disponible: "0",
    stock_maximo: "100",
    umbral_alerta_pct: "20",
    costo_unitario: "0",
  });
  const [reponerCantidad, setReponerCantidad] = useState("10");
  const [editId, setEditId] = useState<number | null>(null);
  const [zonaFiltro, setZonaFiltro] = useState<Zona | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);
  const [zonaStock, setZonaStock] = useState<Zona>("Norte");
  const [editData, setEditData] = useState({
    nombre: "",
    categoria: "",
    unidad_medida: "",
    stock_norte: "",
    stock_sur: "",
    stock_oriental: "",
    stock_occidental: "",
    stock_disponible: "",
    stock_maximo: "",
    umbral_alerta_pct: "",
    costo_unitario: "",
  });
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    if (!partido.iniciado) { setTiempoTranscurrido("00:00"); return; }
    const interval = setInterval(() => {
      if (!partido.inicioEn) return;
      const segundos = Math.floor((Date.now() - partido.inicioEn) / 1000);
      const min = String(Math.floor(segundos / 60)).padStart(2, "0");
      const seg = String(segundos % 60).padStart(2, "0");
      setTiempoTranscurrido(`${min}:${seg}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [partido.iniciado, partido.inicioEn]);

  async function cargarMaterias() {
    try {
      const res = await fetch("/api/materias-primas");
      if (res.ok) {
        const data = await res.json();
        const parseadas = data.map((m: Record<string, unknown>) => ({
          id_materia_prima: m.id_materia_prima as number,
          nombre: m.nombre as string,
          categoria: m.categoria as string | null,
          unidad_medida: m.unidad_medida as string,
          stock_disponible: Number(m.stock_disponible),
          stock_norte: Number(m.stock_norte ?? 0),
          stock_sur: Number(m.stock_sur ?? 0),
          stock_oriental: Number(m.stock_oriental ?? 0),
          stock_occidental: Number(m.stock_occidental ?? 0),
          stock_maximo: Number(m.stock_maximo),
          umbral_alerta_pct: Number(m.umbral_alerta_pct),
          costo_unitario: Number(m.costo_unitario),
          fecha_actualizacion: m.fecha_actualizacion as string | null,
        }));
        setMaterias(parseadas);
      } else {
        console.error("Error fetching materias:", res.status, await res.text());
      }
    } catch (e) {
      console.error("Error cargando materias primas:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarMaterias();
  }, []);

  async function handleReponerStock(id: number, cantidad: number) {
    const materia = materias.find((m) => m.id_materia_prima === id);
    if (!materia) return;
    const zonaKey = `stock_${zonaStock.toLowerCase()}` as keyof typeof materia;
    const nuevoVal = (materia[zonaKey] as number) + cantidad;
    try {
      const res = await fetch(`/api/materias-primas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_norte: zonaStock === "Norte" ? nuevoVal : materia.stock_norte,
          stock_sur: zonaStock === "Sur" ? nuevoVal : materia.stock_sur,
          stock_oriental: zonaStock === "Oriental" ? nuevoVal : materia.stock_oriental,
          stock_occidental: zonaStock === "Occidental" ? nuevoVal : materia.stock_occidental,
        }),
      });
      if (res.ok) {
        const actualizada = await res.json();
        setMaterias((prev) =>
          prev.map((m) => (m.id_materia_prima === id ? actualizada : m))
        );
      }
    } catch {
      /* skip */
    }
  }

  async function handleAgregar() {
    if (!nuevo.nombre || !nuevo.unidad_medida) return;
    try {
      const valBase = parseFloat(nuevo.stock_disponible) || 0;
      const res = await fetch("/api/materias-primas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevo.nombre,
          categoria: nuevo.categoria || null,
          unidad_medida: nuevo.unidad_medida,
          stock_norte: valBase,
          stock_sur: valBase,
          stock_oriental: valBase,
          stock_occidental: valBase,
          stock_disponible: valBase,
          stock_maximo: parseFloat(nuevo.stock_maximo) || 100,
          umbral_alerta_pct: parseFloat(nuevo.umbral_alerta_pct) || 20,
          costo_unitario: parseFloat(nuevo.costo_unitario) || 0,
        }),
      });
      if (res.ok) {
        const creada = await res.json();
        setMaterias((prev) => [...prev, creada]);
        setNuevo({
          nombre: "",
          categoria: "",
          unidad_medida: "unidad",
          stock_disponible: "0",
          stock_maximo: "100",
          umbral_alerta_pct: "20",
          costo_unitario: "0",
        });
        setShowForm(false);
      }
    } catch {
      /* skip */
    }
  }

  async function handleGuardarEdicion(id: number) {
    if (!editData.nombre || !editData.unidad_medida) return;
    try {
      const res = await fetch(`/api/materias-primas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editData.nombre,
          categoria: editData.categoria || null,
          unidad_medida: editData.unidad_medida,
          stock_norte: parseFloat(editData.stock_norte) || 0,
          stock_sur: parseFloat(editData.stock_sur) || 0,
          stock_oriental: parseFloat(editData.stock_oriental) || 0,
          stock_occidental: parseFloat(editData.stock_occidental) || 0,
          stock_maximo: parseFloat(editData.stock_maximo) || 0,
          umbral_alerta_pct: parseFloat(editData.umbral_alerta_pct) || 0,
          costo_unitario: parseFloat(editData.costo_unitario) || 0,
        }),
      });
      if (res.ok) {
        const actualizada = await res.json();
        setMaterias((prev) => prev.map((m) => (m.id_materia_prima === id ? actualizada : m)));
        setEditId(null);
      }
    } catch {
      /* skip */
    }
  }

  async function handleEliminar(id: number) {
    if (!confirm("¿Eliminar este insumo?")) return;
    try {
      const res = await fetch(`/api/materias-primas/${id}`, { method: "DELETE" });
      if (res.ok) setMaterias((prev) => prev.filter((m) => m.id_materia_prima !== id));
    } catch {
      /* skip */
    }
  }

  const pedidosHoy = pedidos.length;

  const tiempoPromedioMin = useMemo(() => {
    const entregados = pedidos.filter((p) => p.estado === "entregado" && p.entregadoEn);
    if (entregados.length === 0) return null;
    const totalMin = entregados.reduce(
      (acc, p) => acc + (p.entregadoEn! - p.creadoEn) / 60_000,
      0
    );
    return totalMin / entregados.length;
  }, [pedidos]);

  const alertas = useMemo(() => {
    return materias
      .filter((m) => {
        const umbral = m.stock_maximo * (m.umbral_alerta_pct / 100);
        return m.stock_disponible < umbral;
      })
      .sort((a, b) => a.stock_disponible - b.stock_disponible);
  }, [materias]);

  const materiasAgotadas = materias.filter((m) => m.stock_disponible <= 0).length;

  const categorias = useMemo(() => {
    const cats = new Set<string>();
    materias.forEach((m) => { if (m.categoria) cats.add(m.categoria); });
    return Array.from(cats).sort();
  }, [materias]);

  const materiasFiltradas = useMemo(() => {
    if (!categoriaFiltro) return materias;
    return materias.filter((m) => m.categoria === categoriaFiltro);
  }, [materias, categoriaFiltro]);

  const topVendidos = useMemo(() => {
    const conteo = new Map<string, number>();
    pedidos.forEach((p) =>
      p.items.forEach((i) => conteo.set(i.nombre, (conteo.get(i.nombre) ?? 0) + i.cantidad))
    );
    return Array.from(conteo.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [pedidos]);

  return (
    <main className="admin-main">
      <header className="admin-header">
        <div>
          <p className="admin-badge">Control de operaciones</p>
          <h1 className="admin-title">Dashboard del estadio</h1>
        </div>
        <Button variant="outline" size="sm" onClick={resetDemo}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reiniciar demo
        </Button>
      </header>

      <div className="admin-kpi-grid">
        <Card>
          <CardContent className="admin-kpi-card">
            <div className="admin-kpi-icon bg-accent/15 text-accent">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="admin-kpi-number">{pedidosHoy}</p>
              <p className="admin-kpi-label">Pedidos hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="admin-kpi-card">
            <div className="admin-kpi-icon bg-pitch-bright/15 text-pitch-bright">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="admin-kpi-number">
                {tiempoPromedioMin !== null ? `${tiempoPromedioMin.toFixed(1)} min` : "—"}
              </p>
              <p className="admin-kpi-label">Tiempo promedio</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="admin-kpi-card">
            <div className="admin-kpi-icon bg-destructive/15 text-destructive">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="admin-kpi-number">{materiasAgotadas}</p>
              <p className="admin-kpi-label">Insumos agotados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {alertas.length > 0 && (
        <div className="admin-alertas">
          {alertas.map((m) => (
            <Alert key={m.id_materia_prima} variant="destructive">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Alerta de inventario</AlertTitle>
              <AlertDescription>
                Reponer <span className="font-bold">{m.nombre}</span> — quedan{" "}
                <span className="font-bold">{m.stock_disponible} {m.unidad_medida}</span>{" "}
                (umbral: {m.umbral_alerta_pct}% = {Math.ceil(m.stock_maximo * (m.umbral_alerta_pct / 100))} {m.unidad_medida}).
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="admin-grid">
        <Card className="admin-inventario">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Materias primas</CardTitle>
                <CardDescription>Stock de insumos en inventario.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-3.5 w-3.5" />
                Agregar
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Cant. a reponer:</span>
              <Input
                type="number"
                min="1"
                value={reponerCantidad}
                onChange={(e) => setReponerCantidad(e.target.value)}
                className="h-8 w-20 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {ZONAS.map((z) => (
                <button
                  key={z}
                  onClick={() => setZonaStock(z)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                    zonaStock === z
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
            {showForm && (
              <div className="mb-4 rounded-md border border-border bg-card p-4 space-y-3">
                <p className="text-sm font-semibold">Nuevo insumo</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nombre"
                    value={nuevo.nombre}
                    onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  />
                  <Input
                    placeholder="Categoría (ej. Proteína)"
                    value={nuevo.categoria}
                    onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
                  />
                  <Input
                    placeholder="Unidad (g, kg, ml, unidad)"
                    value={nuevo.unidad_medida}
                    onChange={(e) => setNuevo({ ...nuevo, unidad_medida: e.target.value })}
                  />
                  <Input
                    placeholder="Stock actual — ej. 0"
                    type="number"
                    value={nuevo.stock_disponible}
                    onChange={(e) => setNuevo({ ...nuevo, stock_disponible: e.target.value })}
                  />
                  <Input
                    placeholder="Stock máximo — ej. 100"
                    type="number"
                    value={nuevo.stock_maximo}
                    onChange={(e) => setNuevo({ ...nuevo, stock_maximo: e.target.value })}
                  />
                  <Input
                    placeholder="Umbral alerta % — ej. 20"
                    type="number"
                    value={nuevo.umbral_alerta_pct}
                    onChange={(e) => setNuevo({ ...nuevo, umbral_alerta_pct: e.target.value })}
                  />
                  <Input
                    placeholder="Costo unitario $ — ej. 5000"
                    type="number"
                    value={nuevo.costo_unitario}
                    onChange={(e) => setNuevo({ ...nuevo, costo_unitario: e.target.value })}
                  />
                </div>
                <Button size="sm" onClick={handleAgregar} className="w-full">
                  <Plus className="h-3.5 w-3.5" />
                  Crear insumo
                </Button>
              </div>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando…</p>
            ) : materias.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay materias primas registradas. Agrega una desde el bot&oacute;n &quot;Agregar&quot;.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <button
                    onClick={() => setCategoriaFiltro(null)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      categoriaFiltro === null
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Todas
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaFiltro(cat)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                        categoriaFiltro === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Insumo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>{zonaStock}</TableHead>
                      <TableHead>Máx</TableHead>
                      <TableHead>Alerta</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead className="text-right">Reponer</TableHead>
                      <TableHead className="text-right w-20">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiasFiltradas.map((m) => {
                      if (editId === m.id_materia_prima) {
                        return (
                          <TableRow key={m.id_materia_prima}>
                            <TableCell colSpan={10} className="p-3">
                              <div className="rounded-md border border-border bg-card p-3 space-y-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Editando: {m.nombre}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <Input className="h-8 text-xs" placeholder="Nombre" value={editData.nombre} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} />
                                  <Input className="h-8 text-xs" placeholder="Categoría" value={editData.categoria} onChange={(e) => setEditData({ ...editData, categoria: e.target.value })} />
                              <Input className="h-8 text-xs" placeholder="Unidad" value={editData.unidad_medida} onChange={(e) => setEditData({ ...editData, unidad_medida: e.target.value })} />
                              <Input className="h-8 text-xs" type="number" placeholder="Stock Norte" value={editData.stock_norte} onChange={(e) => setEditData({ ...editData, stock_norte: e.target.value })} />
                              <Input className="h-8 text-xs" type="number" placeholder="Stock Sur" value={editData.stock_sur} onChange={(e) => setEditData({ ...editData, stock_sur: e.target.value })} />
                              <Input className="h-8 text-xs" type="number" placeholder="Stock Oriental" value={editData.stock_oriental} onChange={(e) => setEditData({ ...editData, stock_oriental: e.target.value })} />
                              <Input className="h-8 text-xs" type="number" placeholder="Stock Occidental" value={editData.stock_occidental} onChange={(e) => setEditData({ ...editData, stock_occidental: e.target.value })} />
                                  <Input className="h-8 text-xs" type="number" placeholder="Stock máx." value={editData.stock_maximo} onChange={(e) => setEditData({ ...editData, stock_maximo: e.target.value })} />
                                  <Input className="h-8 text-xs" type="number" placeholder="Alerta %" value={editData.umbral_alerta_pct} onChange={(e) => setEditData({ ...editData, umbral_alerta_pct: e.target.value })} />
                                  <Input className="h-8 text-xs" type="number" placeholder="Costo $" value={editData.costo_unitario} onChange={(e) => setEditData({ ...editData, costo_unitario: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-8 text-xs flex-1" onClick={() => handleGuardarEdicion(m.id_materia_prima)}>
                                    <Check className="h-3.5 w-3.5" /> Guardar
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditId(null)}>
                                    <X className="h-3.5 w-3.5" /> Cancelar
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      const umbral = m.stock_maximo * (m.umbral_alerta_pct / 100);
                      const bajoStock = m.stock_disponible < umbral;
                      return (
                        <TableRow key={m.id_materia_prima}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" />
                              {m.nombre}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {m.categoria ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={bajoStock ? "soldout" : m.stock_disponible <= 0 ? "soldout" : "success"}>
                              {m.stock_disponible} {m.unidad_medida}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {(() => {
                              const zonaColor: Record<string, string> = { Norte: "text-accent", Sur: "text-emerald-400", Oriental: "text-sky-400", Occidental: "text-amber-400" };
                              const stockKey = `stock_${zonaStock.toLowerCase()}` as keyof typeof m;
                              const val = m[stockKey] as number;
                              return <span className={`font-mono ${val <= 0 ? "text-destructive" : zonaColor[zonaStock]}`}>{val}</span>;
                            })()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {m.stock_maximo} {m.unidad_medida}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {m.umbral_alerta_pct}% ({Math.ceil(umbral)})
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            ${m.costo_unitario.toLocaleString("es-CO")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => {
                                const val = parseInt(reponerCantidad, 10);
                                if (!isNaN(val) && val > 0) handleReponerStock(m.id_materia_prima, val);
                              }}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditId(m.id_materia_prima);
                                  setEditData({
                                    nombre: m.nombre,
                                    categoria: m.categoria ?? "",
                                    unidad_medida: m.unidad_medida,
                                    stock_norte: String(m.stock_norte),
                                    stock_sur: String(m.stock_sur),
                                    stock_oriental: String(m.stock_oriental),
                                    stock_occidental: String(m.stock_occidental),
                                    stock_disponible: String(m.stock_disponible),
                                    stock_maximo: String(m.stock_maximo),
                                    umbral_alerta_pct: String(m.umbral_alerta_pct),
                                    costo_unitario: String(m.costo_unitario),
                                  });
                                }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleEliminar(m.id_materia_prima)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="admin-grafica">
          <CardHeader>
            <CardTitle>Top 5 vendidos</CardTitle>
            <CardDescription>Unidades pedidas en toda la jornada.</CardDescription>
          </CardHeader>
          <CardContent>
            {topVendidos.length === 0 ? (
              <p className="admin-chart-empty">
                Aún no hay ventas registradas.
              </p>
            ) : (
              <Suspense fallback={<div className="admin-chart-container flex items-center justify-center"><p className="text-sm text-muted-foreground">Cargando gráfica…</p></div>}>
                <GraficaTop data={topVendidos} colores={COLORES} />
              </Suspense>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-accent" />
            <CardTitle>Partido en vivo</CardTitle>
            <CardDescription>Control del reloj del partido y activación de combos.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-mono font-bold tabular-nums tracking-wider">
                {partido.iniciado ? tiempoTranscurrido : partido.finalizado ? "FT" : "—:—"}
              </div>
              {partido.medioTiempo && (
                <Badge className="text-base px-3 py-1" variant="warning">MEDIO TIEMPO</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {!partido.iniciado && !partido.finalizado && (
                <Button size="sm" variant="pitch" onClick={iniciarPartido}>
                  <Play className="h-4 w-4" /> Iniciar partido
                </Button>
              )}
              {partido.iniciado && !partido.medioTiempo && (
                <Button size="sm" variant="outline" onClick={() => setMedioTiempo(true)}>
                  <Coffee className="h-4 w-4" /> Medio tiempo
                </Button>
              )}
              {partido.iniciado && partido.medioTiempo && (
                <Button size="sm" variant="pitch" onClick={finalizarPartido}>
                  <Square className="h-4 w-4" /> Finalizar
                </Button>
              )}
              {partido.finalizado && (
                <Button size="sm" variant="outline" onClick={iniciarPartido}>
                  <Play className="h-4 w-4" /> Nuevo partido
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            <CardTitle>Franjas horarias</CardTitle>
            <CardDescription>Ocupación por hora · máximo {MAX_PEDIDOS_POR_FRANJA} pedidos por zona.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  {ZONAS.map((z) => (
                    <TableHead key={z}>Zona {z}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {HORAS_DEL_DIA.map((h) => (
                  <TableRow key={h}>
                    <TableCell className="font-mono text-sm font-bold">{h}</TableCell>
                    {ZONAS.map((z) => {
                      const ocup = franjasOcupadas[h]?.[z] ?? 0;
                      const llena = ocup >= MAX_PEDIDOS_POR_FRANJA;
                      return (
                        <TableCell key={z}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-16 rounded-full ${llena ? "bg-destructive" : ocup > 0 ? "bg-accent/40" : "bg-muted"}`}>
                              <div
                                className={`h-full rounded-full transition-all ${llena ? "bg-destructive" : "bg-accent"}`}
                                style={{ width: `${Math.min(100, (ocup / MAX_PEDIDOS_POR_FRANJA) * 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-mono whitespace-nowrap ${llena ? "text-destructive font-bold" : ocup > 0 ? "text-accent" : "text-muted-foreground"}`}>
                              {ocup}/{MAX_PEDIDOS_POR_FRANJA}
                            </span>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            <CardTitle>Puntos de Recolección</CardTitle>
            <CardDescription>{puntosRecoleccion.length} puntos registrados.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setZonaFiltro(null)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                zonaFiltro === null
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas
            </button>
            {ZONAS.map((z) => (
              <button
                key={z}
                onClick={() => setZonaFiltro(z)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  zonaFiltro === z
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Punto</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Zona</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(zonaFiltro ? [zonaFiltro] : ZONAS).flatMap((z) => {
                  const deEstaZona = puntosRecoleccion.filter((p) => p.zona === z);
                  if (deEstaZona.length === 0) return [];
                  return [
                    <TableRow key={`header-${z}`}>
                      <TableCell colSpan={4} className="bg-muted/30 font-bold text-xs uppercase tracking-wide text-muted-foreground">
                        Zona {z} — {deEstaZona.length} puntos
                      </TableCell>
                    </TableRow>,
                    ...deEstaZona.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {p.nombre}
                          </div>
                        </TableCell>
                        <TableCell>{p.encargado}</TableCell>
                        <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.zona}</Badge>
                        </TableCell>
                      </TableRow>
                    )),
                  ];
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            <CardTitle>Historial de compras</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
              const filtrados = pedidos
                .filter((p) => {
                  const fecha = new Date(p.creadoEn).toISOString().slice(0, 10);
                  if (fechaDesde && fecha < fechaDesde) return false;
                  if (fechaHasta && fecha > fechaHasta) return false;
                  return true;
                })
                .sort((a, b) => b.creadoEn - a.creadoEn);
              const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
              const sep = ";";
              const encabezados = [
                "Pedido #", "Fecha", "Cliente", "Zona", "Ubicación", "Código boleta",
                "Producto", "Cantidad", "Variante", "Precio unitario", "Subtotal",
                "Total pedido", "Estado", "Entrega",
              ].map(esc).join(sep);
              const filas = filtrados.flatMap((p) =>
                p.items.map((i) =>
                  [
                    esc(p.id),
                    esc(new Date(p.creadoEn).toLocaleString("es-CO")),
                    esc(p.codigoBoleta || ""),
                    esc(p.zona),
                    esc(p.tipoEntrega === "pickup" ? "Recoger" : p.tribuna),
                    esc(p.codigoBoleta || ""),
                    esc(i.nombre),
                    esc(i.cantidad),
                    esc(i.variante?.nombre ?? ""),
                    esc(i.precio),
                    esc(i.precio * i.cantidad),
                    esc(p.total),
                    esc(p.estado === "entregado" ? "Entregado" : p.estado === "preparando" ? "Preparando" : p.estado === "notificado" ? "Notificado" : "En camino"),
                    esc(p.tipoEntrega === "pickup" ? "Recoger" : "Delivery"),
                  ].join(sep)
                )
              );
              const blob = new Blob(["\uFEFF" + encabezados + "\n" + filas.join("\n")], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ventas-${fechaDesde || "todo"}-${fechaHasta || "todo"}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </Button>
          </div>
          <CardDescription>Todos los pedidos registrados, filtrables por fecha.</CardDescription>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Desde:</span>
              <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="h-8 w-40 text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Hasta:</span>
              <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="h-8 w-40 text-xs" />
            </div>
            {(fechaDesde || fechaHasta) && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setFechaDesde(""); setFechaHasta(""); }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay pedidos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Código boleta</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Entrega</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos
                    .filter((p) => {
                      const fecha = new Date(p.creadoEn).toISOString().slice(0, 10);
                      if (fechaDesde && fecha < fechaDesde) return false;
                      if (fechaHasta && fecha > fechaHasta) return false;
                      return true;
                    })
                    .sort((a, b) => b.creadoEn - a.creadoEn)
                    .map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="font-mono text-xs">{pedido.id}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(pedido.creadoEn).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="text-xs">{pedido.codigoBoleta || "—"}</TableCell>
                        <TableCell className="text-xs">{pedido.zona}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {pedido.tipoEntrega === "pickup" ? "Recoger en tienda" : pedido.tribuna}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{pedido.codigoBoleta || "—"}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col gap-0.5">
                            {pedido.items.map((item, idx) => (
                              <span key={idx}>
                                {item.emoji} {item.cantidad}x {item.nombre}
                                {item.variante ? ` (${item.variante.nombre})` : ""}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs whitespace-nowrap">
                          ${pedido.total.toLocaleString("es-CO")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pedido.estado === "entregado" ? "success" : pedido.estado === "notificado" ? "warning" : pedido.estado === "preparando" ? "outline" : "secondary"}>
                            {pedido.estado === "entregado" ? "Entregado" : pedido.estado === "preparando" ? "Preparando" : pedido.estado === "notificado" ? "Notificado" : "En camino"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          {pedido.tipoEntrega === "pickup" ? "Recoger" : "Delivery"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

# Silla Delivery — Prototipo FIFA 2026

Prototipo funcional de "Delivery a la Silla" para el estadio modular de 45.000 personas.
Elimina las filas de concesiones: el fanático pide desde su celular y un vendedor le
lleva el pedido hasta su puesto (Tribuna · Fila · Silla).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + componentes estilo **shadcn/ui** (escritos a mano en `src/components/ui`)
- **Zustand** (con `persist` en LocalStorage) como "base de datos" simulada, compartida
  entre las 3 vistas
- **Recharts** para la gráfica de top productos

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

> Los tres roles comparten el mismo LocalStorage del navegador. Para probar el flujo
> completo, abre `/vendedor` y `/admin` en pestañas distintas (o ventanas normales,
> no incógnito) mientras compras desde `/`.

## Rutas

| Ruta | Rol | Qué hace |
|---|---|---|
| `/` | Cliente | Elige asiento (Tribuna/Fila/Silla), arma el carrito, paga con "pulsera cashless" y ve el ticket en `/seguimiento/[id]` |
| `/vendedor` | Vendedor | Login por zona (Norte/Sur/Oriental), ve solo sus pedidos pendientes y los marca como entregados |
| `/admin` | Operaciones | KPIs, inventario en vivo por zona, alertas de stock bajo y gráfica de top 5 vendidos |

## Modelo de datos (simulado)

- **Stock físico** (`producto.stock[zona]`): se descuenta recién cuando el vendedor
  presiona **"Marcar como entregado"** — así el dashboard de admin refleja inventario real.
- **Disponibilidad en el menú del cliente** (`disponible = stock - reservado`): se
  recalcula en tiempo real restando lo que ya está "en camino" en pedidos activos de
  esa zona, para que dos clientes no puedan comprar más de lo que hay.
- Botón **"Reiniciar demo"** en `/admin` restaura stock, pedidos y carritos a su estado inicial.

## Estructura de archivos clave

```
src/
  app/
    page.tsx                 → Vista Cliente
    layout.tsx                → Layout raíz + nav entre roles
    vendedor/page.tsx         → Vista Vendedor
    admin/page.tsx            → Dashboard Admin
    seguimiento/[id]/page.tsx → Seguimiento del pedido
  components/
    ui/                       → Primitivos estilo shadcn (button, card, sheet, table...)
    cliente/                  → SeatSelector, ProductCard, CartSheet
    shared/                   → Nav y guard de hidratación
  store/store.ts              → Store Zustand (carrito, inventario, pedidos)
  lib/data.ts                 → 8 productos + stock inicial por zona
```

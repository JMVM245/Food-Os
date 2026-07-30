export type Zona = "Norte" | "Sur" | "Oriental" | "Occidental";

export const ZONAS: Zona[] = ["Norte", "Sur", "Oriental", "Occidental"];

export const TIENDAS = ["Norte", "Sur", "Oriental", "Occidental"] as const;

export type Tienda = (typeof TIENDAS)[number];

export interface Variante {
  id: string;
  nombre: string;
  precioExtra: number;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: "Comida" | "Bebida";
  precio: number;
  emoji: string;
  stock: Record<Zona, number>;
  stockTienda: Record<Tienda, number>;
  variantes?: Variante[];
}

export const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: "perro",
    nombre: "Perro Caliente",
    categoria: "Comida",
    precio: 12000,
    emoji: "🌭",
    stock: { Norte: 80, Sur: 80, Oriental: 80, Occidental: 80 },
    stockTienda: { Norte: 30, Sur: 30, Oriental: 30, Occidental: 30 },
    variantes: [
      { id: "perro-sencillo", nombre: "Sencillo", precioExtra: 0 },
      { id: "perro-queso", nombre: "Con queso", precioExtra: 2000 },
    ],
  },
  {
    id: "hamburguesa",
    nombre: "Hamburguesa",
    categoria: "Comida",
    precio: 18000,
    emoji: "🍔",
    stock: { Norte: 70, Sur: 70, Oriental: 70, Occidental: 70 },
    stockTienda: { Norte: 25, Sur: 25, Oriental: 25, Occidental: 25 },
    variantes: [
      { id: "hamb-sencilla", nombre: "Sencilla", precioExtra: 0 },
      { id: "hamb-queso", nombre: "Con queso", precioExtra: 3000 },
      { id: "hamb-doble", nombre: "Doble carne", precioExtra: 5000 },
      { id: "hamb-todo", nombre: "Con todo", precioExtra: 7000 },
    ],
  },
  {
    id: "gaseosa",
    nombre: "Gaseosa",
    categoria: "Bebida",
    precio: 8000,
    emoji: "🥤",
    stock: { Norte: 200, Sur: 200, Oriental: 200, Occidental: 200 },
    stockTienda: { Norte: 60, Sur: 60, Oriental: 60, Occidental: 60 },
    variantes: [
      { id: "gas-cocacola", nombre: "Coca-Cola", precioExtra: 0 },
      { id: "gas-sprite", nombre: "Sprite", precioExtra: 0 },
      { id: "gas-fanta", nombre: "Fanta", precioExtra: 0 },
      { id: "gas-pepsi", nombre: "Pepsi", precioExtra: 0 },
      { id: "gas-quatro", nombre: "Quatro", precioExtra: 0 },
    ],
  },
  {
    id: "agua",
    nombre: "Agua",
    categoria: "Bebida",
    precio: 5000,
    emoji: "💧",
    stock: { Norte: 120, Sur: 120, Oriental: 120, Occidental: 120 },
    stockTienda: { Norte: 40, Sur: 40, Oriental: 40, Occidental: 40 },
    variantes: [
      { id: "agua-sgas", nombre: "Sin gas", precioExtra: 0 },
      { id: "agua-cgas", nombre: "Con gas", precioExtra: 1000 },
    ],
  },
  {
    id: "papas",
    nombre: "Papas",
    categoria: "Comida",
    precio: 10000,
    emoji: "🍟",
    stock: { Norte: 90, Sur: 90, Oriental: 90, Occidental: 90 },
    stockTienda: { Norte: 35, Sur: 35, Oriental: 35, Occidental: 35 },
    variantes: [
      { id: "papas-peq", nombre: "Pequeñas", precioExtra: 0 },
      { id: "papas-todo", nombre: "Grandes con todo", precioExtra: 6000 },
      { id: "papas-queso", nombre: "Con queso", precioExtra: 2000 },
    ],
  },
  {
    id: "nachos",
    nombre: "Nachos",
    categoria: "Comida",
    precio: 14000,
    emoji: "🧀",
    stock: { Norte: 50, Sur: 50, Oriental: 50, Occidental: 50 },
    stockTienda: { Norte: 20, Sur: 20, Oriental: 20, Occidental: 20 },
    variantes: [
      { id: "nachos-peq", nombre: "Pequeños", precioExtra: 0 },
      { id: "nachos-todo", nombre: "Grandes con todo", precioExtra: 7000 },
      { id: "nachos-carne", nombre: "Con carne", precioExtra: 5000 },
    ],
  },
  {
    id: "cerveza",
    nombre: "Cerveza",
    categoria: "Bebida",
    precio: 15000,
    emoji: "🍺",
    stock: { Norte: 150, Sur: 150, Oriental: 150, Occidental: 150 },
    stockTienda: { Norte: 50, Sur: 50, Oriental: 50, Occidental: 50 },
    variantes: [
      { id: "cerve-aguila", nombre: "Águila", precioExtra: 0 },
      { id: "cerve-club", nombre: "Club Colombia", precioExtra: 2000 },
      { id: "cerve-poker", nombre: "Poker", precioExtra: 0 },
      { id: "cerve-costena", nombre: "Costeña", precioExtra: 0 },
    ],
  },
];

export interface PuntoRecoleccion {
  id: string;
  nombre: string;
  encargado: string;
  codigo: string;
  zona: Zona;
}

const NOMBRES_PERSONAL = [
  "Carlos","Andrés","Felipe","Diego","Javier","Luis","Miguel","Óscar","Ricardo","Santiago",
  "Mariana","Camila","Valentina","Sofía","Daniela","Paula","Laura","Andrea","Gabriela","Natalia",
  "Julián","Alejandro","David","Sebastián","Mateo","Samuel","Emilio","Martín","Tomás","Benjamín",
  "Lucía","Victoria","Elena","Adriana","Isabel","Rosa","Clara","Pilar","Lorena","Mónica",
];

export const PUNTOS_RECOLECCION_INICIALES: PuntoRecoleccion[] = (() => {
  const puntos: PuntoRecoleccion[] = [];
  let idx = 0;
  for (const zona of ZONAS) {
    const abbr = zona === "Norte" ? "N" : zona === "Sur" ? "S" : zona === "Oriental" ? "O" : "OC";
    for (let i = 0; i < 10; i++) {
      puntos.push({
        id: `punto-${zona.toLowerCase()}-${i + 1}`,
        nombre: `Punto ${zona} ${i + 1}`,
        encargado: NOMBRES_PERSONAL[idx],
        codigo: `${abbr}-P${String(i + 1).padStart(2, "0")}`,
        zona,
      });
      idx++;
    }
  }
  return puntos;
})();

export const VENDEDORES_DEMO: Record<Zona, { nombre: string; codigo: string }> = {
  Norte: { nombre: "Carlos", codigo: "N-A12" },
  Sur: { nombre: "Mariana", codigo: "S-B07" },
  Oriental: { nombre: "Julián", codigo: "O-C03" },
  Occidental: { nombre: "Lucía", codigo: "OC-D09" },
};

export interface Combo {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  precioOriginal: number;
  precioCombo: number;
  productos: { productoId: string; varianteId?: string; cantidad: number }[];
}

export const COMBOS_INICIALES: Combo[] = [
  {
    id: "combo-hamburguesa",
    nombre: "Combo Hamburguesa",
    descripcion: "Hamburguesa + Gaseosa",
    emoji: "🍔🥤",
    precioOriginal: 26000,
    precioCombo: 20000,
    productos: [
      { productoId: "hamburguesa", cantidad: 1 },
      { productoId: "gaseosa", varianteId: "gas-cocacola", cantidad: 1 },
    ],
  },
  {
    id: "combo-perro",
    nombre: "Combo Perro",
    descripcion: "Perro caliente + Gaseosa",
    emoji: "🌭🥤",
    precioOriginal: 20000,
    precioCombo: 15000,
    productos: [
      { productoId: "perro", cantidad: 1 },
      { productoId: "gaseosa", varianteId: "gas-cocacola", cantidad: 1 },
    ],
  },
  {
    id: "combo-papas",
    nombre: "Combo Papas",
    descripcion: "Papas grandes + Gaseosa",
    emoji: "🍟🥤",
    precioOriginal: 18000,
    precioCombo: 13000,
    productos: [
      { productoId: "papas", varianteId: "papas-grandes", cantidad: 1 },
      { productoId: "gaseosa", varianteId: "gas-cocacola", cantidad: 1 },
    ],
  },
  {
    id: "combo-nachos",
    nombre: "Combo Nachos",
    descripcion: "Nachos grandes + Cerveza",
    emoji: "🧀🍺",
    precioOriginal: 24000,
    precioCombo: 18000,
    productos: [
      { productoId: "nachos", varianteId: "nachos-grandes", cantidad: 1 },
      { productoId: "cerveza", varianteId: "cerve-aguila", cantidad: 1 },
    ],
  },
  {
    id: "combo-familiar",
    nombre: "Combo Familiar",
    descripcion: "2 Hamburguesas + 2 Gaseosas + Papas",
    emoji: "🍔🍔🥤🥤🍟",
    precioOriginal: 44000,
    precioCombo: 32000,
    productos: [
      { productoId: "hamburguesa", cantidad: 2 },
      { productoId: "gaseosa", varianteId: "gas-cocacola", cantidad: 2 },
      { productoId: "papas", cantidad: 1 },
    ],
  },
];

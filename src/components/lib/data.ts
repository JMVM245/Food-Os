export type Zona = "Norte" | "Sur" | "Oriental";

export const ZONAS: Zona[] = ["Norte", "Sur", "Oriental"];

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
  variantes?: Variante[];
}

export const PRODUCTOS_INICIALES: Producto[] = [
  {
    id: "perro",
    nombre: "Perro Caliente",
    categoria: "Comida",
    precio: 12000,
    emoji: "🌭",
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
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
    stock: { Norte: 0, Sur: 0, Oriental: 0 },
    variantes: [
      { id: "cerve-aguila", nombre: "Águila", precioExtra: 0 },
      { id: "cerve-club", nombre: "Club Colombia", precioExtra: 2000 },
      { id: "cerve-poker", nombre: "Poker", precioExtra: 0 },
      { id: "cerve-costena", nombre: "Costeña", precioExtra: 0 },
    ],
  },
];

export const VENDEDORES_DEMO: Record<Zona, { nombre: string; codigo: string }> = {
  Norte: { nombre: "Carlos", codigo: "N-A12" },
  Sur: { nombre: "Mariana", codigo: "S-B07" },
  Oriental: { nombre: "Julián", codigo: "O-C03" },
};

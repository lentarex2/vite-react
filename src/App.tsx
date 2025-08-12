import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Car, X, Filter, ChevronDown, Trash2, Info } from "lucide-react";

// ------------------------------------------------------------
// AutoMart - Single-page React e‑commerce UI (Cars)
// Tech: React + TailwindCSS (no imports needed here) + lucide-react icons
// Features: Search, filters, sort, product grid, product modal, cart drawer,
//           localStorage persistence, price formatting for NGN.
// ------------------------------------------------------------

// ----------------------- Types ------------------------------
type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
type Transmission = "Automatic" | "Manual";

export type CarProduct = {
  id: string;
  name: string;
  brand: string;
  year: number;
  price: number; // NGN
  mileageKm: number;
  fuel: FuelType;
  transmission: Transmission;
  image: string;
  description: string;
};

export type CartItem = {
  product: CarProduct;
  qty: number;
};

// ----------------------- Mock Data --------------------------
const PRODUCTS: CarProduct[] = [
  {
    id: "1",
    name: "Toyota Corolla LE",
    brand: "Toyota",
    year: 2021,
    price: 14500000,
    mileageKm: 32000,
    fuel: "Petrol",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop",
    description:
      "Reliable compact sedan with excellent fuel economy, reverse camera, Apple CarPlay/Android Auto, and full service history.",
  },
  {
    id: "2",
    name: "Honda Civic Sport",
    brand: "Honda",
    year: 2022,
    price: 18200000,
    mileageKm: 24000,
    fuel: "Petrol",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1606660951803-2c81f00f1e9f?q=80&w=1600&auto=format&fit=crop",
    description:
      "Sport trim with responsive handling, lane assist, adaptive cruise control, and premium sound.",
  },
  {
    id: "3",
    name: "Mercedes-Benz C300",
    brand: "Mercedes",
    year: 2020,
    price: 36500000,
    mileageKm: 41000,
    fuel: "Petrol",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1600&auto=format&fit=crop",
    description:
      "Luxury interior with panoramic roof, Burmester audio, ambient lighting, and advanced safety suite.",
  },
  {
    id: "4",
    name: "BMW 3 Series 330i",
    brand: "BMW",
    year: 2019,
    price: 29500000,
    mileageKm: 55000,
    fuel: "Petrol",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop",
    description:
      "Driver-focused sedan with dynamic handling, digital cockpit, and connected services.",
  },
  {
    id: "5",
    name: "Tesla Model 3 Long Range",
    brand: "Tesla",
    year: 2023,
    price: 52000000,
    mileageKm: 12000,
    fuel: "Electric",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1600&auto=format&fit=crop",
    description:
      "All‑electric sedan with Autopilot, excellent range, over‑the‑air updates, and minimalist interior.",
  },
  {
    id: "6",
    name: "Toyota Camry XSE",
    brand: "Toyota",
    year: 2021,
    price: 23500000,
    mileageKm: 38000,
    fuel: "Hybrid",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1549921296-3c9b1d2f0a4b?q=80&w=1600&auto=format&fit=crop",
    description:
      "Hybrid efficiency with sporty styling, safety sense suite, and leather interior.",
  },
  {
    id: "7",
    name: "Ford Ranger XLT 4x4",
    brand: "Ford",
    year: 2018,
    price: 18500000,
    mileageKm: 76000,
    fuel: "Diesel",
    transmission: "Manual",
    image:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop",
    description:
      "Rugged pickup with 4x4 capability, bed liner, and towing package — ideal for Nigerian roads.",
  },
  {
    id: "8",
    name: "Lexus RX 350",
    brand: "Lexus",
    year: 2020,
    price: 42000000,
    mileageKm: 30000,
    fuel: "Petrol",
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1600&auto=format&fit=crop",
    description:
      "Premium SUV with quiet cabin, comfortable ride, and advanced driver assistance features.",
  },
];

// ------------------- Utilities ------------------------------
const NGN = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

function classNames(...arr: (string | false | undefined)[]) {
  return arr.filter(Boolean).join(" ");
}

// ------------------- Root Component -------------------------
export default function AutoMartPage() {
  // Search & Filters
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string[]>([]);
  const [fuel, setFuel] = useState<FuelType | "">("");
  const [transmission, setTransmission] = useState<Transmission | "">("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minYear, setMinYear] = useState<number | "">("");
  const [maxYear, setMaxYear] = useState<number | "">("");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Modal & Cart
  const [selected, setSelected] = useState<CarProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("automart_cart");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("automart_cart", JSON.stringify(cart));
  }, [cart]);

  const brands = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort(), []);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (brand.length) list = list.filter((p) => brand.includes(p.brand));
    if (fuel) list = list.filter((p) => p.fuel === fuel);
    if (transmission) list = list.filter((p) => p.transmission === transmission);
    if (minPrice !== "") list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== "") list = list.filter((p) => p.price <= Number(maxPrice));
    if (minYear !== "") list = list.filter((p) => p.year >= Number(minYear));
    if (maxYear !== "") list = list.filter((p) => p.year <= Number(maxYear));

    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => b.year - a.year);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // relevance: keep as-is
        break;
    }

    return list;
  }, [query, brand, fuel, transmission, minPrice, maxPrice, minYear, maxYear, sortBy]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.product.price, 0);

  function addToCart(product: CarProduct) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.product.id !== id));
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => prev.map((c) => (c.product.id === id ? { ...c, qty: Math.max(1, qty) } : c)));
  }

  function toggleBrand(b: string) {
    setBrand((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <div className="h-9 w-9 grid place-items-center rounded-2xl bg-black text-white"><Car size={18} /></div>
            <span>AutoMart</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 w-[420px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cars, brands, specs…"
              className="w-full rounded-2xl border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Controls */}
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="md:hidden inline-flex items-center gap-2 border rounded-2xl px-3 py-2"
          >
            <Filter size={16} /> Filters
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 border rounded-2xl px-3 py-2"
          >
            <ShoppingCart size={16} />
            <span className="text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 grid place-items-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
          {/* Brand filter */}
          <div className="relative">
            <details className="group">
              <summary className="list-none cursor-pointer inline-flex items-center gap-2 border rounded-2xl px-3 py-2">
                Brand <ChevronDown size={16} className="transition group-open:rotate-180" />
              </summary>
              <div className="absolute mt-2 bg-white border rounded-2xl p-3 shadow-lg grid grid-cols-2 gap-2 z-10">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={classNames(
                      "text-left px-3 py-2 rounded-xl border",
                      brand.includes(b) ? "bg-black text-white" : "hover:bg-gray-50"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Fuel */}
          <select
            value={fuel}
            onChange={(e) => setFuel(e.target.value as FuelType | "")}
            className="border rounded-2xl px-3 py-2"
          >
            <option value="">Fuel</option>
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </select>

          {/* Transmission */}
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value as Transmission | "")}
            className="border rounded-2xl px-3 py-2"
          >
            <option value="">Transmission</option>
            <option>Automatic</option>
            <option>Manual</option>
          </select>

          {/* Price */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min ₦"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-28 border rounded-2xl px-3 py-2"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max ₦"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-28 border rounded-2xl px-3 py-2"
            />
          </div>

          {/* Year */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min Year"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value ? Number(e.target.value) : "")}
              className="w-28 border rounded-2xl px-3 py-2"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              placeholder="Max Year"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value ? Number(e.target.value) : "")}
              className="w-28 border rounded-2xl px-3 py-2"
            />
          </div>

          {/* Sort */}
          <div className="ml-auto">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-2xl px-3 py-2">
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cars, brands, specs…"
            className="w-full rounded-2xl border px-4 py-2 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className={classNames(
                    "px-3 py-2 rounded-xl border",
                    brand.includes(b) ? "bg-black text-white" : "bg-white"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">{filtered.length} cars found</h2>
          <div className="text-sm text-gray-500 inline-flex items-center gap-1">
            <Info size={14} /> Prices in NGN; add to cart to get a quote.
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <article key={p.id} className="group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                  loading="lazy"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{p.name}</h3>
                  <span className="text-sm rounded-full border px-2 py-0.5 bg-gray-50">{p.brand}</span>
                </div>

                <div className="text-2xl font-bold">{NGN.format(p.price)}</div>

                <ul className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                  <li>Year: <span className="font-medium text-gray-800">{p.year}</span></li>
                  <li>Mileage: <span className="font-medium text-gray-800">{p.mileageKm.toLocaleString()} km</span></li>
                  <li>Fuel: <span className="font-medium text-gray-800">{p.fuel}</span></li>
                  <li>Trans.: <span className="font-medium text-gray-800">{p.transmission}</span></li>
                </ul>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelected(p)}
                    className="flex-1 rounded-2xl border px-4 py-2 hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      addToCart(p);
                      setCartOpen(true);
                    }}
                    className="flex-1 rounded-2xl bg-black text-white px-4 py-2"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Product Modal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-[16/12] bg-gray-100">
                <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <div className="text-2xl font-bold">{NGN.format(selected.price)}</div>
                <ul className="text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
                  <li>Brand: <span className="font-medium">{selected.brand}</span></li>
                  <li>Year: <span className="font-medium">{selected.year}</span></li>
                  <li>Fuel: <span className="font-medium">{selected.fuel}</span></li>
                  <li>Transmission: <span className="font-medium">{selected.transmission}</span></li>
                  <li>Mileage: <span className="font-medium">{selected.mileageKm.toLocaleString()} km</span></li>
                </ul>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 rounded-2xl border px-4 py-2"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selected);
                      setCartOpen(true);
                      setSelected(null);
                    }}
                    className="flex-1 rounded-2xl bg-black text-white px-4 py-2"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <aside
        aria-label="Shopping cart"
        className={classNames(
          "fixed top-0 right-0 h-full w-[92vw] sm:w-[420px] bg-white shadow-2xl z-50 transition-transform",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="inline-flex items-center gap-2 font-semibold">
            <ShoppingCart size={18} /> Your Cart
          </div>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {cart.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
          {cart.map((item) => (
            <div key={item.product.id} className="flex gap-3 border rounded-2xl p-3">
              <div className="h-20 w-28 rounded-xl overflow-hidden bg-gray-100">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.product.name}</div>
                <div className="text-sm text-gray-600">{NGN.format(item.product.price)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm text-gray-500">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => setQty(item.product.id, Number(e.target.value))}
                    className="w-20 border rounded-xl px-3 py-1"
                  />
                </div>
              </div>
              <button
                aria-label={`Remove ${item.product.name}`}
                onClick={() => removeFromCart(item.product.id)}
                className="self-start p-2 rounded-full hover:bg-gray-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="font-semibold">{NGN.format(subtotal)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            className={classNames(
              "w-full rounded-2xl px-4 py-3 text-white",
              cart.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-black"
            )}
            onClick={() => alert("Checkout flow is not implemented in this demo.")}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p>
              © {new Date().getFullYear()} AutoMart by Lentarex Ltd. Built with React & Tailwind. Demo data only.
            </p>
            <nav className="flex items-center gap-4">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Support</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

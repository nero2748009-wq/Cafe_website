import { useRef, useState } from "react"
import "./home.css"
import NavBar from "../../components/NavBar"
import Footer from "../../components/Footer"

/* ==========================================================
   Hero background image
   ----------------------------------------------------------
========================================================== */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1690983326252-ce6205fb7055?w=1920&auto=format&fit=crop&q=90&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FmZSUyMGJhY2tncm91bmR8ZW58MHwwfDB8fHww"

/* ==========================================================
   Menu data
   ----------------------------------------------------------
   One list drives BOTH the menu cards and the order list.
   To add a photo to a card, add an `image` field, e.g.
     image: "/menu/latte.jpg"   (file goes in public/menu/)
========================================================== */
type Category = "coffee" | "food" | "dessert"

interface MenuItem {
  id: string
  name: string
  desc: string
  price: number
  category: Category
  image?: string
}

const MENU: MenuItem[] = [
  // Coffee
  { id: "latte", category: "coffee", name: "Cafe Latte", price: 240, desc: "Espresso, steamed milk, latte art on top." },
  { id: "espresso", category: "coffee", name: "Espresso", price: 150, desc: "Short, strong, straight from the machine." },
  { id: "cappuccino", category: "coffee", name: "Cappuccino", price: 220, desc: "Equal parts espresso, milk, and foam." },
  { id: "americano", category: "coffee", name: "Americano", price: 180, desc: "Espresso, hot water, nothing in the way." },
  { id: "mocha", category: "coffee", name: "Mocha", price: 260, desc: "Espresso and steamed milk with chocolate." },
  { id: "coldbrew", category: "coffee", name: "Cold Brew", price: 280, desc: "Slow-steeped overnight, served over ice." },

  // Food
  { id: "sandwich", category: "food", name: "Chicken Sandwich", price: 320, desc: "Grilled chicken, fresh greens, toasted bread." },
  { id: "vegclub", category: "food", name: "Veg Club Sandwich", price: 280, desc: "Layered vegetables, cheese, house sauce." },
  { id: "fries", category: "food", name: "French Fries", price: 180, desc: "Crisp-edged, salted, served hot." },
  { id: "pasta", category: "food", name: "Pasta Alfredo", price: 380, desc: "Creamy white sauce, parmesan, herbs." },

  // Desserts
  { id: "redvelvet", category: "dessert", name: "Red Velvet Cake", price: 250, desc: "Soft layers, cream cheese frosting." },
  { id: "sundae", category: "dessert", name: "Ice Cream Sundae", price: 260, desc: "Vanilla scoops, chocolate drizzle." },
  { id: "brownie", category: "dessert", name: "Chocolate Brownie", price: 200, desc: "Dense, fudgy, warmed on request." },
  { id: "cheesecake", category: "dessert", name: "Cheesecake Slice", price: 280, desc: "Baked, dense, lightly tart on top." },
]

// Tab buttons shown above the menu
const TABS: { key: Category; label: string }[] = [
  { key: "coffee", label: "Coffee" },
  { key: "food", label: "Food" },
  { key: "dessert", label: "Desserts" },
]

// Small helper so prices are formatted the same everywhere
const rs = (n: number) => `Rs. ${n}`

export default function Home() {
  /* ---------- Refs ---------- */
  const menuScrollRef = useRef<HTMLDivElement>(null) // horizontal menu row

  /* ---------- State ---------- */
  const [activeTab, setActiveTab] = useState<Category>("coffee")
  // Cart is a map of item id -> quantity, e.g. { latte: 2, fries: 1 }
  const [cart, setCart] = useState<Record<string, number>>({})
  // Whether the "Order noted!" message is visible
  const [ordered, setOrdered] = useState(false)

  /* ==========================================================
     Menu tabs
  ========================================================== */
  const handleTab = (key: Category) => {
    setActiveTab(key)
    // Jump the card row back to the start when the category changes
    menuScrollRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }

  // Only show cards for the selected category
  const visibleItems = MENU.filter((item) => item.category === activeTab)

  /* ==========================================================
     Order / cart
  ========================================================== */
  const changeQty = (id: string, delta: number) => {
    setCart((prev) => ({
      ...prev,
      // Never let a quantity go below 0
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }))
    // Any change to the cart hides the old confirmation message
    setOrdered(false)
  }

  // Items that are actually in the cart, with line totals
  const cartLines = MENU.filter((item) => (cart[item.id] ?? 0) > 0).map(
    (item) => ({
      ...item,
      qty: cart[item.id],
      lineTotal: item.price * cart[item.id],
    })
  )

  const total = cartLines.reduce((sum, line) => sum + line.lineTotal, 0)

  return (
    <>

    <NavBar />
      {/* ===== Hero ===== */}
      <section
        id="top"
        className="hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="section-inner hero-inner">
          <div className="kicker">Pick Me Cafe · Hetauda</div>
          <h1>Coffee worth slowing down for.</h1>
          <p>
            Fresh coffee, good food, and cake in Hetauda. Take a look at the
            menu, or just pull up a chair.
          </p>

          <div className="hero-actions">
            <a href="#menu" className="btn btn-caramel">
              See the menu
            </a>
            <a href="#order" className="btn btn-light">
              Order online
            </a>
          </div>

          <div className="hero-meta">
            <span>CX8P+87P, Hetauda</span>
            <a href="tel:+9779768578666">+977 976-8578666</a>
          </div>
        </div>
      </section>

      {/* ===== Intro ===== */}
      <section>
        <div className="section-inner intro">
          <div>
            <div className="kicker">About the cafe</div>
            <h2>Coffee and food, meant to be enjoyed slowly.</h2>
          </div>
          <p>
            Pick Me Cafe is a coffee and food spot in Hetauda, built for
            mornings that don't need to be rushed. Hand-poured coffee, simple
            food, and cake worth coming back for — pull up a chair and stay a
            while.
          </p>
        </div>
      </section>

      {/* ===== Menu ===== */}
      <section className="menu" id="menu">
        <div className="section-inner">
          <div className="menu-head">
            <div className="kicker">Menu</div>
            <h2>A few favourites</h2>
          </div>

          {/* Category tabs */}
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => handleTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="menu-hint">Scroll sideways to see more →</div>

          {/* Cards for the active category */}
          <div className="menu-scroll" ref={menuScrollRef}>
            {visibleItems.map((item) => (
              <div className="menu-card" key={item.id}>
                {/* Real photo if provided, otherwise a text placeholder */}
                {item.image ? (
                  <img className="thumb" src={item.image} alt={item.name} />
                ) : (
                  <div className="thumb placeholder">{item.name}</div>
                )}

                <div className="menu-card-body">
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-desc">{item.desc}</div>
                  <div className="menu-card-price">{rs(item.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Order online (demo only, nothing is sent anywhere) ===== */}
      <section id="order">
        <div className="section-inner order-grid">
          <div>
            <div className="order-head">
              <div className="kicker">Order online</div>
              <h2>Build your order</h2>
              <p>
                Pick what you'd like and send the order through — we'll confirm
                it by phone before it's made.
              </p>
              <div className="order-note">
                This is a working demo on this page only: it isn't connected to
                payment or our kitchen printer yet. Placing an order here sends
                nothing automatically — call +977 976-8578666 to order right
                now.
              </div>
            </div>

            {/* One row per menu item with − / + buttons */}
            <div className="order-list">
              {MENU.map((item) => (
                <div className="order-row" key={item.id}>
                  <div>
                    <div className="order-row-name">{item.name}</div>
                    <div className="order-row-price">{rs(item.price)}</div>
                  </div>

                  <div className="qty">
                    <button
                      type="button"
                      aria-label={`Remove one ${item.name}`}
                      onClick={() => changeQty(item.id, -1)}
                    >
                      −
                    </button>
                    <span>{cart[item.id] ?? 0}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${item.name}`}
                      onClick={() => changeQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart summary */}
          <div className="cart-box">
            <h3>Your order</h3>

            <div className="cart-lines">
              {cartLines.length === 0 ? (
                <div className="cart-empty">No items yet</div>
              ) : (
                cartLines.map((line) => (
                  <div key={line.id}>
                    {line.name} × {line.qty} — {rs(line.lineTotal)}
                  </div>
                ))
              )}
            </div>

            <div className="cart-total">
              <span>Total</span>
              <span>{rs(total)}</span>
            </div>

            {/* Disabled until something is in the cart */}
            <button
              className="btn btn-caramel"
              disabled={total === 0}
              onClick={() => setOrdered(true)}
            >
              Place order
            </button>

            <div className={`confirm-msg ${ordered ? "show" : ""}`}>
              Order noted! We'll call you to confirm — or ring us directly at
              +977 976-8578666.
            </div>
          </div>
        </div>
      </section>

      {/* ===== Visit / Contact ===== */}
      <section className="visit" id="visit">
        <div className="section-inner visit-grid">
          <div>
            <div className="kicker">Visit / Contact</div>
            <h2>Find the cafe</h2>

            <div className="visit-detail">
              <div className="visit-detail-label">Address</div>
              <div className="visit-detail-value">
                CX8P+87P, Hetauda, Bagmati Province 44100, Nepal
              </div>
            </div>

            <div className="visit-detail">
              <div className="visit-detail-label">Hours</div>
              <div className="visit-detail-value">
                Opens 6 AM Sunday
                {/* Static text copied from Google; update if hours change */}
              
              </div>
            </div>

            <div className="visit-detail">
              <div className="visit-detail-label">Phone</div>
              <div className="visit-detail-value">
                <a href="tel:+9779768578666">+977 976-8578666</a>
              </div>
            </div>
          </div>

          <div>
            {/* Embedded Google Map */}
            <div className="map-frame">
              <iframe
                src="https://maps.google.com/maps?q=CX8P%2B87P%20Hetauda%20Nepal&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pick Me Cafe location map"
              ></iframe>
            </div>

            <a
              className="map-link"
              href="https://www.google.com/maps/search/?api=1&query=CX8P%2B87P+Hetauda+Bagmati+Province+Nepal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
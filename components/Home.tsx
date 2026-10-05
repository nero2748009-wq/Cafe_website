import { useEffect, useRef, useState } from "react"
import NavBar from "./NavBar"
import Footer from "./Footer"
import "./Home.css"

/* ==========================================================
   Hero frame animation settings
   ----------------------------------------------------------
   Frames live in public/frames/ and are named f_001.jpg,
   f_002.jpg ... Set FRAME_COUNT to the number printed by:
     ls public/frames | wc -l
========================================================== */
const FRAME_COUNT = 59

const frameSrc = (i: number) =>
  `/frames/f_${String(i + 1).padStart(3, "0")}.jpg`

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
  const wrapRef = useRef<HTMLDivElement>(null) // tall scroll wrapper
  const canvasRef = useRef<HTMLCanvasElement>(null) // where frames are drawn
  const menuScrollRef = useRef<HTMLDivElement>(null) // horizontal menu row

  const [activeTab, setActiveTab] = useState<Category>("coffee")
  // Cart is a map of item id -> quantity, e.g. { latte: 2, fries: 1 }
  const [cart, setCart] = useState<Record<string, number>>({})
  // Whether the "Order noted!" message is visible
  const [ordered, setOrdered] = useState(false)

  /* ==========================================================
     Scroll-scrubbed hero animation
     ----------------------------------------------------------
     1. Preload every frame as an <img>.
     2. On scroll, work out how far through the hero we are
        (0 to 1) and convert that to a frame number.
     3. A requestAnimationFrame loop eases toward that frame
        and draws it on the canvas.
  ========================================================== */
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!wrap || !canvas || !ctx) return

    const images: HTMLImageElement[] = []
    let current = 0 // frame position we're currently showing (smoothed)
    let target = 0 // frame position the scroll wants
    let lastDrawn = -1 // avoid redrawing the same frame
    let rafId = 0

    // Preload all frames
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()

      // First frame sets the canvas size and draws immediately
      if (i === 0) {
        img.onload = () => {
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          ctx.drawImage(img, 0, 0)
          lastDrawn = 0
        }
      }

      img.src = frameSrc(i)
      images.push(img)
    }

    // Convert scroll position into a target frame
    const updateTarget = () => {
      const rect = wrap.getBoundingClientRect()
      const total = wrap.offsetHeight - window.innerHeight
      if (total <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / total))
      target = progress * (FRAME_COUNT - 1)
    }

    // Ease toward the target and draw
    const tick = () => {
      // 0.2 = how tightly we follow scroll. 1 = instant, lower = floatier
      current += (target - current) * 0.2

      const idx = Math.round(current)
      const img = images[idx]

      if (idx !== lastDrawn && img && img.complete && canvas.width) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        lastDrawn = idx
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener("scroll", updateTarget, { passive: true })
    window.addEventListener("resize", updateTarget)
    updateTarget()
    rafId = requestAnimationFrame(tick)

    // Cleanup when the component unmounts
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", updateTarget)
      window.removeEventListener("resize", updateTarget)
    }
  }, [])

  /* ==========================================================
     Menu tabs
  ========================================================== */
  const handleTab = (key: Category) => {
    setActiveTab(key)
    // Reset the card row when the category changes
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
      // Prevent negative quantities
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

      {/* Hero */}
      <div id="top" className="hero-wrap" ref={wrapRef}>
        <div className="hero-sticky">
          <canvas ref={canvasRef} className="hero-canvas" />
          <div className="scroll-hint"></div>
        </div>
      </div>

      {/* About */}
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

      {/* Menu */}
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

      {/* Order online */}
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

      {/* Visit / Contact */}
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
                <div className="status-pill">
                  <span className="status-dot"></span>
                  Closed now — as listed on Google
                </div>
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

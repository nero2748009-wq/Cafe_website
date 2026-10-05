import "./NavBar.css"

export default function NavBar() {
  return (
    <div className="topbar">
      <a href="#top" className="wordmark">
        Pick Me Cafe
      </a>

      <ul className="topbar-links">
        <li>
          <a href="#menu">Menu</a>
        </li>
        <li>
          <a href="#order">Order Online</a>
        </li>
        <li>
          <a href="#visit">Visit</a>
        </li>
      </ul>

      <div className="topbar-right">
        <a href="tel:+9779768578666" className="topbar-phone">
          +977 976-8578666
        </a>
        <a href="#order" className="btn btn-caramel">
          Order Online
        </a>
      </div>
    </div>
  )
}

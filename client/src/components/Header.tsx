import { useAuth } from './context/AuthContext.js';

export default function Header() {
  const { logout } = useAuth();

  return (
    <div className="bg-blue py-3">
      <div className="container  d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start ">
        <a href="/" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
          <h3>XO GAME</h3>
        </a>

        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
          <li>
            <a href="/" className="nav-link px-2 link-secondary">
              Home
            </a>
          </li>

          <li></li>
        </ul>

        <div className="dropdown text-end">
          <a
            href="#"
            className="d-block link-dark text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" className="rounded-circle"></img>
          </a>
          <ul className="dropdown-menu text-small" aria-labelledby="dropdownUser1">
            {/* <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li> */}
            {/* <li>
              <hr className="dropdown-divider"></hr>
            </li> */}
            <li>
              <button className="dropdown-item" onClick={() => logout()}>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

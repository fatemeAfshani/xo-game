import gameLogo from './../assets/game.svg';
import * as Icon from 'react-bootstrap-icons';

export default function Footer() {
  return (
    <div className="bg-blue ">
      <footer className="container d-flex flex-wrap justify-content-between align-items-center py-3 mt-4 border-top ">
        <div className="col-md-4 d-flex align-items-center">
          <a href="/" className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
            <img src={gameLogo} className="logo" alt="Vite logo" />
          </a>
          <span className="mb-3 mb-md-0 text-body-secondary">© 2023 Created By Fateme Afshani</span>
        </div>

        <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
          <li className="ms-3">
            <a className="text-body-secondary" href="https://github.com/fatemeAfshani">
              <Icon.Github size={30} />
            </a>
          </li>
          <li className="ms-3">
            <a className="text-body-secondary" href="https://linkedin.com/in/fatemeh-afshani-310095181">
              <Icon.Linkedin size={30} />
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

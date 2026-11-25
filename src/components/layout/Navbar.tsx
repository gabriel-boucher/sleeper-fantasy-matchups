import { MouseEvent } from 'react';
import { useUserSearchContext } from '../../context/userSearchContext';
import { AppName } from '../common/AppName';
import { UsernameForm } from '../search/UsernameForm';
import './Navbar.css';

const PRIMARY_MOUSE_BUTTON = 0;

function opensInNewTabOrWindow(e: MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.button !== PRIMARY_MOUSE_BUTTON;
}

interface NavbarProps {
  username: string;
}

export function Navbar({ username }: NavbarProps) {
  const { goHome } = useUserSearchContext();

  function handleHomeClick(e: MouseEvent<HTMLAnchorElement>) {
    if (opensInNewTabOrWindow(e)) return;
    e.preventDefault();
    goHome();
  }

  return (
    <header className="navbar on-turf">
      <div className="navbar-inner">
        <h1 className="navbar-title">
          <a href="/" className="navbar-home" onClick={handleHomeClick}><AppName /></a>
        </h1>
        <UsernameForm key={username} initialUsername={username} />
      </div>
    </header>
  );
}

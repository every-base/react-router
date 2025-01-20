import { Link, Outlet } from "../../lib/main";

export default function Layout() {
  return (
    <>
      <aside>
        <Link to='/'>@everybase/router</Link>
        <ul>
          <li>
            <Link to='/dashboard'>Dasboard</Link>
          </li>
          <li>
            <Link to='/users/1'>User 1</Link>
          </li>
          <li>
            <Link to='/not-found'>Not found</Link>
          </li>
        </ul>
      </aside>
      <main>
        <Outlet />
      </main>
    </>
  )
}
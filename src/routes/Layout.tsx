import Router from "../Router";

export default function Layout() {
  return (
    <>
      <aside>
        <Router.Link to='/'>@everybase/router</Router.Link>
        <ul>
          <li>
            <Router.Link to='/dashboard'>Dasboard</Router.Link>
          </li>
          <li>
            <Router.Link to='/users/1'>User 1</Router.Link>
          </li>
          <li>
            <Router.Link to='/not-found'>Not found</Router.Link>
          </li>
        </ul>
      </aside>
      <main>
        <Router.Outlet />
      </main>
    </>
  )
}
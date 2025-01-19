import Router from "../Router";

export default function MainLayout() {
  return (
    <>
      <Router.Link to={-1}>Back</Router.Link>
      <Router.Outlet />
    </>
  )
}
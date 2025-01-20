import { Link, Outlet } from '../../lib/main';

export default function MainLayout() {
  return (
    <>
      <Link to={-1}>Back</Link>
      <Outlet />
    </>
  )
}
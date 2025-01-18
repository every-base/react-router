import { createContext, lazy, Suspense, useContext } from "react"

const LocationContext = createContext<Location | undefined>(undefined)
const useLocation = () => useContext(LocationContext)!

const ParamsContext = createContext<Record<string, string> | undefined>(undefined)
const useParams = () => useContext(ParamsContext)!

const OutletContext = createContext<React.ReactNode>(undefined)
const useOutlet = () => useContext(OutletContext)

export type Route = {
  children?: Route[]
} & (
  {
    path?: string
    index?: never
  } | {
    path?: never
    index: true
  }
) & (
  {
    Component?: React.ElementType
    element?: never
    lazy?: never
  } | {
    Component?: never
    element?: React.ReactNode
    lazy?: never
  } | {
    Component?: never
    element?: never
    lazy?: () => Promise<{ default: React.ComponentType }>
  }
)

export function createRouter(routes: Route[]) {
  function Router() {
    return (
      <LocationContext value={location}>
        <Routes routes={routes} />
      </LocationContext>
    )
  }

  Router.useOutlet = useOutlet
  Router.useParams = useParams

  Router.Outlet = Outlet

  return Router
}

interface RoutesProps {
  routes: Route[]
}

function Routes({ routes }: RoutesProps) {
  const { pathname } = useLocation()
  const routeMatch = matchRoute(routes, pathname)
  
  if (!routeMatch) return null

  return (
    <ParamsContext value={routeMatch.params}>
      {renderRoutes(routes, routeMatch.path)}
    </ParamsContext>
  )
}

type RouteProps = React.PropsWithChildren<Omit<Route, 'children'>>

function Route({
  children: outlet,
  lazy: load,
  Component = Outlet,
  element = <Component />,
}: RouteProps) {
  let children = element
  if (load) {
    const Lazy = lazy(load)
    children = (
      <Suspense>
        <Lazy />
      </Suspense>
    )
  }
  
  return (
    <OutletContext value={outlet}>
      {children}
    </OutletContext>
  )
}

function Outlet() {
  return useOutlet()
}

function renderRoutes(routes: Route[], path: number[]) {
  const [currIdx, ...subPath] = path

  return routes.map(({ children = [], ...props }, idx) => {
    if (currIdx !== idx) return null

    return (
      <Route key={idx} {...props}>
        {renderRoutes(children, subPath)}
      </Route>
    )
  })
}

interface RouteMatch {
  path: number[]
  pathname: string
  routename: string
  params: Record<string, string>
}

function matchRoute(routes: Route[], pathname: string, basename = ''): RouteMatch | null {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const currentPath = joinPath(basename, route.path)

    if (route.children) {
      const match = matchRoute(route.children, pathname, currentPath)      

      if (!match) continue

      return {
        ...match,
        path: [i, ...match.path]
      }
    }

    const routename = currentPath.startsWith('/') ? currentPath : `/${currentPath}`
    const pathMatch = matchPath(routename, pathname)

    if (!pathMatch) continue

    return {
      ...pathMatch,
      path: [i]
    }
  }

  return null
}

const joinPath = (p1 = '', p2 = '') => [p1.replace(/\/$/, ''), p2.replace(/^\//, '')]
  .filter(Boolean)
  .join('/')

interface PathMatch {
  pathname: string
  routename: string
  params: Record<string, string>
}

function matchPath(routename: string, pathname: string): PathMatch | null {
  const regex = new RegExp(`^${
    routename
      .replace('/*', '/?(?<_splat>.*)')
      .replace(/\/:[^/]+/g, key => `/(?<${key.slice(2)}>[^/]*)`)
  }$`)

  const match = pathname.match(regex)
  if (!match) return null

  const { _splat, ...params } = match.groups || {}
  if (_splat !== undefined) params['*'] = _splat

  return {
    pathname,
    routename,
    params
  }
}

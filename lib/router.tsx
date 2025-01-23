import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from "react"
import { createNavigation, type Navigation }from './navigation'
import { type Location } from "./history"

const NavigationContext = createContext<Navigation | undefined>(undefined)
export const useNavigation = () => useContext(NavigationContext)!

const LocationContext = createContext<Location | undefined>(undefined)
export const useLocation = () => useContext(LocationContext)!

const ParamsContext = createContext<Record<string, string> | undefined>(undefined)
export const useParams = () => useContext(ParamsContext)!

const OutletContext = createContext<React.ReactNode>(undefined)
const useOutlet = () => useContext(OutletContext)

type LazyLoad = () => Promise<{ default: React.ComponentType }>

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
    lazy?: LazyLoad
  }
)

type RouterProps = React.PropsWithChildren<{
  history?: History
}>

export function Router({ children, history = window.history }: RouterProps) {
  const [location, setLocation] = useState<Location>(window.location)
  const navigation = useMemo(() => createNavigation(history), [history])
  
  useEffect(() => navigation.register(({ location }) => setLocation(location)), [navigation])

  return (
    <NavigationContext value={navigation}>
      <LocationContext value={location}>
        {children}
      </LocationContext>
    </NavigationContext>
  )
}

interface RoutesProps {
  routes: Route[]
}

export function Routes({ routes }: RoutesProps) {
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

const LazyComponentMap = new Map<LazyLoad, React.LazyExoticComponent<React.ComponentType>>()

function Route({
  children: outlet,
  lazy: load,
  Component = Outlet,
  element = <Component />,
}: RouteProps) {
  let children = element
  if (load) {
    if (!LazyComponentMap.has(load)) {
      LazyComponentMap.set(load, lazy(load))
    }
    
    const Lazy = LazyComponentMap.get(load)!
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

export function Outlet() {
  return useOutlet()
}

type AnchorLinkProps = Omit<React.ComponentPropsWithRef<'a'>, 'href'> & {
  to: string
  replace?: boolean
}
type ButtonLinkProps = React.ComponentPropsWithRef<'button'> & {
  to: number
}

export function Link(props: AnchorLinkProps): React.JSX.Element
export function Link(props: ButtonLinkProps): React.JSX.Element
export function Link(props: AnchorLinkProps | ButtonLinkProps) {
  const navigation = useNavigation()

  if (isButtonLinkProps(props)) {
    const { to, ...rest } = props
    
    return (
      <button 
        {...rest} 
        onClick={() => navigation.go(to)}
      />
    )
  }

  const { to, replace, ...rest } = props

  return (
    <a 
      {...rest} 
      href={to}
      onClick={e => {
        e.preventDefault()
        if (replace) {
          navigation.replace(to)
        } else {
          navigation.push(to)
        }
      }} 
    />
  )
}

function isButtonLinkProps(props: AnchorLinkProps | ButtonLinkProps): props is ButtonLinkProps {
  return typeof props.to === 'number'
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

import Home from './routes/Home'
import Layout from './routes/Layout'
import MainLayout from './routes/MainLayout'
import { type Route, Router, Routes } from '../lib/main'

const routes: Route[] = [
  {
    Component: Layout,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        Component: MainLayout,
        children: [
          {
            path: 'dashboard',
            lazy: () => import('./routes/Dashboard')
          },
          {
            path: 'users',
            children: [
              {
                path: ':userId',
                lazy: () => import('./routes/User')
              }
            ]
          }
        ]
      },
    ]
  },
  {
    path: '*',
    Component: () => <p>Page not found</p>
  }
]

export default function App() {
  return (
    <Router>
      <Routes routes={routes} />
    </Router>
  )
}
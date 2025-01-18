import { createRouter }from '../lib/main'
import Home from './routes/Home'
import Layout from './routes/Layout'

const Router = createRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        element: <Home />
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
  {
    path: '*',
    Component: () => <p>Page not found</p>
  }
])

export default Router
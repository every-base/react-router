import React from 'react'
import ReactDOM from 'react-dom/client'
import Router from './Router'
import './style.css'

ReactDOM.createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
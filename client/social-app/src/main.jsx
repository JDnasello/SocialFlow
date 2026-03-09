import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from './redux/store.js'
import TimeAgo from 'javascript-time-ago'
import es from 'javascript-time-ago/locale/es.json'

TimeAgo.addDefaultLocale(es)
TimeAgo.addLocale(es)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
  </React.StrictMode>,
)

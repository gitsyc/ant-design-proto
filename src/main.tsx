import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import AdminLayout from './layouts/AdminLayout'
import SalesOrdersPage from './pages/SalesOrdersPage'
import VehicleArchivesListPage from './pages/VehicleArchivesListPage'
import VehiclePurchaseOrdersPage from './pages/VehiclePurchaseOrdersPage'
import { AppThemeProvider } from './theme/AppThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/sales/orders" replace />} />
            <Route path="/sales/orders" element={<SalesOrdersPage />} />
            <Route path="/vehicle/orders" element={<Navigate to="/vehicle/purchase/orders" replace />} />
            <Route path="/vehicle/purchase/orders" element={<VehiclePurchaseOrdersPage />} />
          <Route path="/vehicle/archives" element={<VehicleArchivesListPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppThemeProvider>
  </React.StrictMode>
)

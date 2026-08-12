import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import AdminLayout from './layouts/AdminLayout'
import SalesOrdersPage from './pages/SalesOrdersPage'
import SalesOrderDetailPage from './pages/SalesOrderDetailPage'
import SalesUnbindApplyDetailPage from './pages/SalesUnbindApplyDetailPage'
import SalesUnbindApplyListPage from './pages/SalesUnbindApplyListPage'
import PurchaseOrderCreatePage from './pages/PurchaseOrderCreatePage'
import VehicleArchivesListPage from './pages/VehicleArchivesListPage'
import VehiclePurchaseOrdersPage from './pages/VehiclePurchaseOrdersPage'
import MajorCustomerFilingListPage from './pages/MajorCustomerFilingListPage'
import MajorCustomerFilingFormPage from './pages/MajorCustomerFilingFormPage'
import { AppThemeProvider } from './theme/AppThemeProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/sales/orders" replace />} />
            <Route path="/sales/orders" element={<SalesOrdersPage />} />
            <Route path="/sales/orders/:orderNo" element={<SalesOrderDetailPage />} />
            <Route path="/sales/unbind-applies" element={<SalesUnbindApplyListPage />} />
            <Route path="/sales/unbind-applies/:applyNo" element={<SalesUnbindApplyDetailPage />} />
            <Route path="/vehicle/orders" element={<Navigate to="/vehicle/purchase/orders" replace />} />
            <Route path="/vehicle/purchase/orders" element={<VehiclePurchaseOrdersPage />} />
            <Route path="/vehicle/purchase/create" element={<PurchaseOrderCreatePage />} />
            <Route path="/vehicle/purchase/filings" element={<MajorCustomerFilingListPage />} />
            <Route path="/vehicle/purchase/filings/create" element={<MajorCustomerFilingFormPage />} />
            <Route path="/vehicle/archives" element={<VehicleArchivesListPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppThemeProvider>
  </React.StrictMode>
)

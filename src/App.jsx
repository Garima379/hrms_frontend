import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Layout from './components/Layout'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function App() {
  return (
    <BrowserRouter future={routerFutureFlags}>
      <Layout>
        <Routes>
          <Route path="/" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

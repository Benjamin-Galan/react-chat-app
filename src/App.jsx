import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from "./views/Login"
import Register from "./views/Register"
import AuthLayout from './components/AuthLayout'
import Chat from './views/Chat'
import ProtectedRoute from "./ProtectedRoute"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

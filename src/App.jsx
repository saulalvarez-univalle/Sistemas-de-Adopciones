import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import RecuperarPassword from "./pages/RecuperarPassword";
import Panel from "./pages/Panel";

import DashboardAdmin from "./pages/admin/DashboardAdmin";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminRoute from "./components/AdminRoute";

import Perfil from "./pages/Perfil";

import Albergue from "./pages/Albergue";

import GestionAlbergues from "./pages/GestionAlbergues";

import GestionEspecies from "./pages/admin/GestionEspecies";

import Navbar from "./components/Navbar";

import Refugios from "./pages/Refugios";

import Mascotas from "./pages/Mascotas";

import DetalleMascota from "./pages/DetalleMascota";

import MisMascotas from "./pages/MisMascotas";

import Favoritos from "./pages/Favoritos";

import SolicitudAdopcion from "./pages/SolicitudAdopcion";

import MisSolicitudes from "./pages/MisSolicitudes";

import SolicitudesAlbergue from "./pages/SolicitudesAlbergue";

function App() {
    return (
        <BrowserRouter>
        <Navbar />
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/registro" element={<Registro />} />

                <Route path="/login" element={<Login />} />

                <Route path="/recuperar-password" element={<RecuperarPassword />} />

                <Route path="/panel" element={
                        <ProtectedRoute>
                            <Panel />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <DashboardAdmin />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/perfil"
                    element={
                        <ProtectedRoute>
                          <Perfil />
                        </ProtectedRoute>
                    }
                />

                <Route
                  path="/albergue"
                  element={
                      <ProtectedRoute>
                        <Albergue />
                      </ProtectedRoute>
                  }
                />

                <Route
                  path="/gestion-albergues"
                  element={
                      <AdminRoute>
                        <GestionAlbergues />
                      </AdminRoute>
                  }
                />

                <Route
                  path="/gestion-especies"
                  element={
                      <AdminRoute>
                        <GestionEspecies />
                      </AdminRoute>
                  }
                />

                <Route path="/refugios" element={<Refugios />} />

                <Route path="/mascotas" element={<Mascotas />} />

                <Route path="/mascotas/:id" element={<DetalleMascota />} />

                <Route
                  path="/mis-mascotas"
                  element={
                      <ProtectedRoute>
                        <MisMascotas />
                      </ProtectedRoute>
                  }
                />

                <Route
                  path="/favoritos"
                  element={
                      <ProtectedRoute>
                        <Favoritos />
                      </ProtectedRoute>
                  }
                />

                <Route
                  path="/solicitar/:mascotaId"
                  element={
                      <ProtectedRoute>
                        <SolicitudAdopcion />
                      </ProtectedRoute>
                  }
                />

                <Route
                  path="/mis-solicitudes"
                  element={
                      <ProtectedRoute>
                        <MisSolicitudes />
                      </ProtectedRoute>
                  }
                />

                <Route
                  path="/solicitudes-albergue"
                  element={
                      <ProtectedRoute>
                        <SolicitudesAlbergue />
                      </ProtectedRoute>
                  }
                />
            </Routes>

        </BrowserRouter>
    );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { useAuthStore } from './stores/useAuthStore';
import { useThemeStore } from './stores/useThemeStore';
import { StudentLayout } from './pages/student/StudentLayout';
import { StudentHome } from './pages/student/StudentHome';
import { StudentCalendar } from './pages/student/StudentCalendar';
import { StudentTechniques } from './pages/student/StudentTechniques';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentProgress } from './pages/student/StudentProgress';
import { ProfessorLayout } from './pages/professor/ProfessorLayout';
import { ProfessorHome } from './pages/professor/ProfessorHome';
import { ProfessorClasses } from './pages/professor/ProfessorClasses';
import { ProfessorAttendance } from './pages/professor/ProfessorAttendance';
import { ProfessorContent } from './pages/professor/ProfessorContent';
import { ProfessorLessons } from './pages/professor/ProfessorLessons';

import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Map backend roles to frontend route requirements if needed or standardise
  // Assuming routes use 'student' | 'professor' but user has 'aluno' | 'professor'
  // Let's standardise the route allowedRoles to match backend: 'aluno' | 'professor'

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'aluno' ? '/aluno' : '/professor'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Redirect Root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/aluno"
          element={
            <ProtectedRoute allowedRoles={['aluno']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="calendario" element={<StudentCalendar />} />
          <Route path="tecnicas" element={<StudentTechniques />} />
          <Route path="progresso" element={<StudentProgress />} />
          <Route path="perfil" element={<StudentProfile />} />
        </Route>

        {/* Protected Professor Routes */}
        <Route
          path="/professor"
          element={
            <ProtectedRoute allowedRoles={['professor', 'admin']}>
              <ProfessorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfessorHome />} />
          <Route path="turmas" element={<ProfessorClasses />} />
          <Route path="aulas" element={<ProfessorLessons />} />
          <Route path="presenca" element={<ProfessorAttendance />} />
          <Route path="conteudos" element={<ProfessorContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

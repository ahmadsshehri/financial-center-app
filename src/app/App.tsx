import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { ProtectedRoute, PublicRoute } from './routes';
import { ROUTES } from '../constants/routes';

import { WelcomePage } from '../pages/WelcomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { IncomePage } from '../pages/IncomePage';
import { CentersPage } from '../pages/CentersPage';
import { TasksPage } from '../pages/TasksPage';
import { AnalysisPage } from '../pages/AnalysisPage';
import { SettingsPage } from '../pages/SettingsPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.WELCOME}
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.ONBOARDING}
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INCOME}
          element={
            <ProtectedRoute>
              <IncomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CENTERS}
          element={
            <ProtectedRoute>
              <CentersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.TASKS}
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ANALYSIS}
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTES.WELCOME} replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

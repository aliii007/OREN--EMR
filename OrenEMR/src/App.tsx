import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import DoctorRoute from './components/DoctorRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './components/layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleCalendarCallback from './pages/auth/GoogleCalendarCallback';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Patient Pages
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetails from './pages/patients/PatientDetails';

// Notes Pages
import NotesPage from './pages/notes/NotesPage';
import NoteForm from './pages/notes/NoteForm';
import NotePrintView from './pages/notes/NotePrintView';

// Appointment Pages
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentForm from './pages/appointments/AppointmentForm';
import AppointmentDetails from './pages/appointments/AppointmentDetails';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';

// Visit Pages
import InitialVisitForm from './pages/visits/InitialVisitForm';
import FollowupVisitForm from './pages/visits/FollowupVisitForm';
import DischargeVisitForm from './pages/visits/DischargeVisitForm';
import VisitDetails from './pages/visits/VisitDetails';

// Billing Pages
import BillingList from './pages/billing/BillingList';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import InvoiceForm from './pages/billing/InvoiceForm';

// Task Pages
import TasksPage from './pages/tasks/TasksPage';
import TaskFormPage from './pages/tasks/TaskFormPage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';

// Notification Pages
import NotificationsPage from './pages/notifications/NotificationsPage';

// Report Pages
import UnsettledCaseReport from './pages/reports/UnsettledCaseReport';

// Settings Page
import Settings from './pages/settings/Settings';

// Layout Components
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Initialize the QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskProvider>
          <NotificationProvider>
            <Router>
              <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google-calendar/callback" element={<GoogleCalendarCallback />} />

            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Patient Routes */}
              <Route path="patients" element={<PatientList />} />
              <Route path="patients/new" element={<PatientForm />} />
              <Route path="patients/:id" element={<PatientDetails />} />
              <Route path="patients/:id/edit" element={<PatientForm />} />

              {/* Notes Routes */}
              <Route path="notes" element={<NotesPage />} />
              <Route path="notes/new" element={<NoteForm />} />
              <Route path="notes/:id/edit" element={<NoteForm />} />
              <Route path="notes/:id/print" element={<NotePrintView />} />

              {/* Task Routes */}
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/new" element={<TaskFormPage />} />
              <Route path="tasks/:id" element={<TaskDetailPage />} />
              <Route path="tasks/edit/:id" element={<TaskFormPage />} />

              {/* Notification Routes */}
              <Route path="notifications" element={<NotificationsPage />} />

              {/* Appointment Routes */}
              <Route path="appointments" element={<AppointmentCalendar />} />
              <Route path="appointments/list" element={<AppointmentList />} />
              <Route path="appointments/new" element={<AppointmentForm />} />
              <Route path="appointments/:id" element={<AppointmentDetails />} />
              <Route path="appointments/:id/edit" element={<AppointmentForm />} />

              {/* Visit Routes */}
              <Route path="patients/:id/visits/initial" element={<DoctorRoute><InitialVisitForm /></DoctorRoute>} />
              <Route path="patients/:id/visits/followup" element={<DoctorRoute><FollowupVisitForm /></DoctorRoute>} />
              <Route path="patients/:id/visits/discharge" element={<DoctorRoute><DischargeVisitForm /></DoctorRoute>} />
              <Route path="visits/:id" element={<VisitDetails />} />

              {/* Billing Routes */}
              <Route path="billing" element={<BillingList />} />
              <Route path="billing/new" element={<InvoiceForm />} />
              <Route path="billing/:id" element={<InvoiceDetails />} />
              <Route path="billing/:id/edit" element={<InvoiceForm />} />

              {/* Report Routes */}
              <Route path="reports/unsettled-cases" element={<UnsettledCaseReport />} />

              {/* Settings Route */}
              <Route path="settings" element={<Settings />} />

              {/* Admin Routes */}
              <Route path="admin/*" element={<AdminRoute><div>Admin Panel</div></AdminRoute>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
              <ToastContainer position="top-right" autoClose={3000} />
            </Router>
          </NotificationProvider>
        </TaskProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

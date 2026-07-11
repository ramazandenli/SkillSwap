import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ChatPage } from './features/chat/ChatPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/home/:username', element: <HomePage /> },
      { path: '/messages', element: <ChatPage /> },
      { path: '/messages/:peer', element: <ChatPage /> },
    ],
  },
]);

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import AuthRoot from '@/pages/auth/AuthRoot';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Root from '@/Root';
import AuthGuard from '@/pages/me/AuthGuard';
import ClientGuard from '@/pages/me/Client/ClientGuard';
import SalonGuard from '@/pages/me/Salon/SalonGuard';
import RegisterClient from '@/pages/me/RegisterClient';
import RegisterSalon from '@/pages/me/RegisterSalon';
import ClientHome from '@/pages/me/Client/ClientHome';
import SalonHome from '@/pages/me/Salon/SalonHome';

const router = createBrowserRouter([
  {
    path: '',
    element: <Root />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'auth',
        element: <AuthRoot />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'sign-up',
            element: <Register />,
          },
        ],
      },
      {
        path: 'me',
        element: <AuthGuard />,
        children: [
          {
            path: 'client',
            element: <ClientGuard />,
            children: [
              {
                path: '',
                element: <ClientHome />,
              },
            ],
          },
          {
            path: 'salon',
            element: <SalonGuard />,
            children: [
              {
                path: '',
                element: <SalonHome />,
              },
            ],
          },
          {
            path: 'registerClient',
            element: <RegisterClient />,
          },
          {
            path: 'registerSalon',
            element: <RegisterSalon />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

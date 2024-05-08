import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '@/pages/Home/Home';
import AuthRoot from '@/pages/auth/AuthRoot';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Root from '@/Root';
import AuthGuard from '@/pages/me/AuthGuard';
import PostQuestion from '@/pages/me/PostQuestion';
import Question from '@/pages/Question/Question';

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
        path: 'question/:questionId',
        element: <Question />,
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
            path: 'post',
            element: <PostQuestion />,
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

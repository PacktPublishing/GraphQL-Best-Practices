import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "@/Home";
import AuthRoot from "@/auth/AuthRoot";
import Login from "@/auth/Login";
import Register from "@/auth/Register";
import Root from "@/Root";
import AuthGuard from "@/authorized/AuthGuard";
import PostQuestion from "@/authorized/PostQuestion";
import Question from "@/pages/Question";

const router = createBrowserRouter([
  {
    path: "",
    element: <Root />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "question/:questionId",
        element: <Question />,
      },
      {
        path: "auth",
        element: <AuthRoot />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "sign-up",
            element: <Register />,
          },
        ],
      },
      {
        path: "me",
        element: <AuthGuard />,
        children: [
          {
            path: "post",
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

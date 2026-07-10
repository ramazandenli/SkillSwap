import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Auth from "./Pages/Auth";
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Messages from './Pages/Messages';
import Admin from "./Pages/Admin"
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext';


const router=createBrowserRouter([
  

  {
    path:"/",
    element:<Auth/>,
    errorElement:<Login/>
   
  },
  {

    path:"/signup",
    element:<Signup/>
  },
  {

    path:"/login",
    element:<Login/>
  },
  {

    path:"/home/:username",
    element:<ProtectedRoute><Home/></ProtectedRoute>
  },
  {

    path:"/messages/:username",
    element:<ProtectedRoute><Messages/></ProtectedRoute>,
  },
  {

         
    path:"/messages/:username/:user",
    element:<ProtectedRoute><Messages/></ProtectedRoute>

  },
  {

    path:"/admin",
    element:<ProtectedRoute><Admin/></ProtectedRoute>
  }

 
  

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
    <RouterProvider router={router}/>
    </AuthProvider>
   
  </React.StrictMode>
);

reportWebVitals();

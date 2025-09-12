import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { UserContextProvider } from './context/context.jsx';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
const GOOGLE_CLIENT_ID =
  '392444995136-nemsqm87neq7ukojedcalevanrerarnc.apps.googleusercontent.com';
createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <UserContextProvider>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
          toastStyle={{
            backgroundColor: '#000',
            color: '#fff',
          }}
        />
      </UserContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
);

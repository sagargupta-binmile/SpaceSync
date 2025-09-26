import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { UserContextProvider } from './context/context.jsx';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLOUD_KEY;
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
            backgroundColor: '#7a5c45',
            color: '#fff',
          }}
        />
      </UserContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
);

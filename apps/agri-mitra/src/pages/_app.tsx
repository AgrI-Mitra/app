import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
// import ContextProvider from '../context/ContextProvider';
import { useSocketContext, ContextProvider } from 'uci_sdk';
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import 'chatui/dist/index.css';
import { Toaster } from 'react-hot-toast';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLogin } from '../hooks';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const LaunchPage = dynamic(() => import('../components/LaunchPage'), {
  ssr: false,
});
const NavBar = dynamic(() => import('../components/NavBar'), {
  ssr: false,
});
function SafeHydrate({ children }: { children: ReactElement }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const { isAuthenticated, login } = useLogin();
  const [launch, setLaunch] = useState(true);
  const [cookie, setCookie, removeCookie] = useCookies();

  useEffect(() => {
    setTimeout(() => {
      setLaunch(false);
    }, 2500);

    // Initialize an agent at application startup.
    const fpPromise = FingerprintJS.load();

    (async () => {
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
      const stringToUuid = (str: any) => {
        str = str.replace('-', '');
        return 'xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx'.replace(
          /[x]/g,
          function (c, p) {
            return str[p % str.length];
          }
        );
      };
      localStorage.setItem('userID', stringToUuid(result?.visitorId));
    })();
  }, []);

  // const handleLoginRedirect = useCallback(() => {
  //   if (router.pathname === '/login' || router.pathname.startsWith('/otp')) {
  //     // already logged in then send to home
  //     if (cookie['access_token'] && localStorage.getItem('userID')) {
  //       router.push('/');
  //     }
  //   } else {
  //     // not logged in then send to login page
  //     if (!cookie['access_token'] || !localStorage.getItem('userID')) {
  //       localStorage.clear();
  //       sessionStorage.clear();
  //       router.push('/login');
  //     }
  //   }
  // }, [cookie, router]);

  // useEffect(() => {
  //   handleLoginRedirect();
  // }, [handleLoginRedirect]);

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     login();
  //   }
  // }, [isAuthenticated, login]);

  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (launch) {
    return <LaunchPage />;
  } else {
    return (
      <ChakraProvider>
        <ContextProvider
          deviceId={localStorage.getItem('userID') || ''}
          uuId={localStorage.getItem('userID') || ''}
          URL={process.env.NEXT_PUBLIC_SOCKET_URL || ''}
          onMsgReceived={(msg: any) => console.log(msg)}>

          <div style={{ height: '100%' }}>
            <Toaster position="top-center" reverseOrder={false} />
            <NavBar />
            <SafeHydrate>
              <Component {...pageProps} />
            </SafeHydrate>
          </div>

        </ContextProvider>
      </ChakraProvider>
    );
  }
};

export default App;

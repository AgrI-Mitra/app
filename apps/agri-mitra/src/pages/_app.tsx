import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import ContextProvider from '../context/ContextProvider';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import 'chatui/dist/index.css';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { IntlProvider } from 'react-intl';

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
  const [launch, setLaunch] = useState(true);
  const [locale, setLocale] = useState('en');
  const [localeMsgs, setLocaleMsgs] = useState<Record<string, string> | null>(
    null
  );

  function loadMessages(locale: string) {
    switch (locale) {
      case 'en':
        return import('../../lang/en.json');
      case 'hi':
        return import('../../lang/hi.json');
      case 'bn':
        return import('../../lang/bn.json');
      case 'ta':
        return import('../../lang/ta.json');
      case 'te':
        return import('../../lang/te.json');
      default:
        return import('../../lang/en.json');
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale');
      if (savedLocale) {
        setLocale(savedLocale);
      }
    }
  }, []);

  useEffect(() => {
    if (locale) {
      //@ts-ignore
      loadMessages(locale).then((res) => setLocaleMsgs(res));
    }
  }, [locale]);

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


  if (process.env.NODE_ENV === 'production') {
    globalThis.console.log = () => {};
  }

  if (launch) {
    return (
      //@ts-ignore
      <IntlProvider locale="en" messages={localeMsgs}>
        <LaunchPage />
      </IntlProvider>
    );
  } else {
    return (
      <ChakraProvider>
        <ContextProvider>
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

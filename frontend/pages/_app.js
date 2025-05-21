// frontend/pages/_app.js
import * as React from 'react';
import { appWithTranslation } from 'next-i18next';
import '../styles/globals.module.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
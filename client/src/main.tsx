import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

import { useEffect } from 'react';

useEffect(() => {
  const script1 = document.createElement("script");
  script1.src = "https://www.googletagmanager.com/gtag/js?id=G-25L2MWVRVD";
  script1.async = true;
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-25L2MWVRVD');
  `;
  document.head.appendChild(script2);
}, []);

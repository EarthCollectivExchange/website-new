import React, { useState, useEffect } from 'react';
import { PAGES, TREE } from './data.js';
import { Nav, Footer, ScrollProgress } from './components.jsx';
import { Home } from './Home.jsx';
import { PageView } from './sections.jsx';

// Make TREE available for the EcosystemTree component
window.EARTHOS_TREE = TREE;

function NotFound() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="container" style={{ padding: "clamp(80px,18vh,200px) 0", textAlign: "center" }}>
      <span className="eyebrow">Off the map</span>
      <h1 className="display h1 gradient-text" style={{ margin: "1rem 0" }}>This page isn't here yet.</h1>
      <p className="lede" style={{ maxWidth: "40ch", margin: "0 auto 2rem" }}>Much of EarthOS is still foundation and plan. That's honest, not broken.</p>
      <a className="btn btn-primary" href="#/home">Back to EarthOS <span className="arrow">&rarr;</span></a>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash());

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "").trim();
    return h || "home";
  }
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    addEventListener("hashchange", onHash);
    if (!location.hash) location.replace("#/home");
    return () => removeEventListener("hashchange", onHash);
  }, []);

  const isHome = route === "home";
  const known = isHome || PAGES[route];

  return (
    <div className="shell">
      <ScrollProgress />
      <Nav />
      <main key={route}>
        {isHome ? <Home /> : (known ? <PageView slug={route} /> : <NotFound />)}
      </main>
      <Footer />
    </div>
  );
}

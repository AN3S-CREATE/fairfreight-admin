import './Loading.css';

import * as React from 'react';

export const Loading: React.FC = function () {
  const [theme, setTheme] = React.useState("auto");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("theme");
    if (t === "dark" || t === "light") {
      setTheme(t);
    } else {
      setTheme("auto");
    }
  }, []);
  React.useEffect(() => {
    document.body.classList.remove("light", "dark", "auto");
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 grid-bg"
        style={{
          backgroundSize: "50px 50px",
          backgroundPosition: "0 0",
          animation: "move-bg 4s linear infinite",
          willChange: "background-position",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center radial-mask [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="z-10 text-[#777] text-md opacity-0 scale-90 animate-fadeInScale">
        Spinning up your preview…
      </div>
    </div>
  );
}

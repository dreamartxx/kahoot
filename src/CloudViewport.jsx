import React, { useLayoutEffect, useRef, useState } from "react";

// Keep the live cloud inside the stage as answers arrive, without adding pages.
export default function CloudViewport({ enabled, children }) {
  const box = useRef(null),
    content = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    if (!enabled) return;
    const fit = () => {
      if (!box.current || !content.current) return;
      setScale(
        Math.min(
          1,
          box.current.clientHeight / Math.max(1, content.current.offsetHeight),
          box.current.clientWidth / Math.max(1, content.current.offsetWidth),
        ),
      );
    };
    const observer = new ResizeObserver(fit);
    observer.observe(box.current);
    observer.observe(content.current);
    fit();
    return () => observer.disconnect();
  }, [enabled]);
  if (!enabled) return children;
  return (
    <div className="fit-cloud" ref={box}>
      <div ref={content} style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

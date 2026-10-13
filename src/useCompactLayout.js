import { useEffect, useState } from "react";
import { nativeApp } from "./native";
export default function useCompactLayout() {
  const [compact, setCompact] = useState(
    () => nativeApp || matchMedia("(max-width: 800px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width: 800px)");
    const update = () => setCompact(nativeApp || media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}

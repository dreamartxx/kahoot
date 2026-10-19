import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { nativeApp } from "./native";
import { screenPageOffsets } from "./screen-pages";

/** Keeps form state mounted while presenting long mobile screens in pages. */
export default function ScreenPages({
  children,
  dialog = false,
  resetKey = "",
  manualScroll = false,
}) {
  const box = useRef(null),
    content = useRef(null);
  const [enabled, setEnabled] = useState(
    () => nativeApp || matchMedia("(max-width: 800px)").matches,
  );
  const [layout, setLayout] = useState({
    height: 0,
    offsets: [0],
    nav: false,
    tail: 0,
  });
  const [page, setPage] = useState(0);
  const current = Math.min(page, layout.offsets.length - 1);
  const paging = layout.offsets.length > 1;
  const fixed = enabled && !manualScroll && layout.fit;
  const visibleHeight = Math.min(
    layout.height,
    (layout.offsets[current + 1] ?? Infinity) - layout.offsets[current],
  );

  useEffect(() => {
    const mq = matchMedia("(max-width: 800px)");
    const update = () => setEnabled(nativeApp || mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => setPage(0), [resetKey]);
  useLayoutEffect(() => {
    if (!enabled || manualScroll) return;
    let frame, scene;
    const measure = () => {
      const el = box.current,
        inner = content.current;
      if (!el || !inner) return;
      const nextScene =
        inner.querySelector("[data-screen-key]")?.dataset.screenKey;
      if (nextScene !== scene) {
        scene = nextScene;
        setPage(0);
      }
      const visualHeight = window.visualViewport?.height || innerHeight;
      if (inner.querySelector('[data-screen-fit="true"]')) {
        const height = Math.max(
          120,
          visualHeight - el.getBoundingClientRect().top,
        );
        setLayout((old) =>
          old.fit && old.height === height
            ? old
            : { height, offsets: [0], nav: false, tail: 0, fit: true },
        );
        return;
      }
      const nav = dialog ? null : inner.querySelector(".mobile-bottom-nav");
      const navHeight = nav?.getBoundingClientRect().height || 0;
      // Dialog title remains outside this viewport; leave room for its padding.
      const available = dialog
        ? Math.max(120, visualHeight - el.getBoundingClientRect().top - 40)
        : Math.max(
            120,
            visualHeight - el.getBoundingClientRect().top - navHeight,
          );
      const total = inner.getBoundingClientRect().height;
      const height =
        total > available + 2 ? available - 52 : Math.min(total, available);
      const origin = inner.getBoundingClientRect().top;
      const blocks = [
        ...inner.querySelectorAll(
          "section, article, .profile-card, .field, button, label, input, textarea, select, p, h1, h2, h3, li, summary, .room-row, .profile-setting-row",
        ),
      ]
        .filter(
          (node) =>
            node.getClientRects().length && !node.closest(".mobile-bottom-nav"),
        )
        .map((node) => {
          const r = node.getBoundingClientRect();
          return [r.top - origin, r.bottom - origin];
        });
      const offsets = screenPageOffsets(total, height, blocks);
      const tail = Math.max(0, offsets.at(-1) + height - total);
      setLayout((old) =>
        !old.fit &&
        old.height === height &&
        old.tail === tail &&
        old.nav === !!nav &&
        old.offsets.join() === offsets.join()
          ? old
          : { height, offsets, nav: !!nav, tail },
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(content.current);
    const mutations = new MutationObserver(schedule);
    mutations.observe(content.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "open",
        "class",
        "hidden",
        "data-screen-key",
        "data-screen-fit",
      ],
    });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [enabled, dialog, resetKey, manualScroll]);
  useLayoutEffect(() => {
    if (box.current)
      box.current.scrollTop =
        enabled && !manualScroll && !layout.fit ? layout.offsets[current] : 0;
  }, [enabled, layout, current, manualScroll]);

  const reveal = (event) => {
    if (
      layout.fit ||
      manualScroll ||
      !enabled ||
      !paging ||
      !content.current?.contains(event.target)
    )
      return;
    const bounds = event.target.getBoundingClientRect();
    const origin = content.current.getBoundingClientRect().top;
    const top = bounds.top - origin,
      bottom = bounds.bottom - origin;
    if (
      top >= layout.offsets[current] &&
      bottom <= layout.offsets[current] + visibleHeight
    )
      return;
    const index = layout.offsets.findIndex(
      (offset, i) =>
        offset <= top &&
        Math.min(offset + layout.height, layout.offsets[i + 1] ?? Infinity) >=
          bottom,
    );
    if (index >= 0) setPage(index);
  };
  return (
    <div
      style={fixed ? { "--screen-height": `${layout.height}px` } : undefined}
      className={`screen-pages ${enabled && !fixed ? (manualScroll ? "manual-scroll" : "is-paged") : ""} ${dialog ? "dialog-pages" : "app-pages"} ${layout.nav ? "has-bottom-nav" : ""}`}
    >
      <div
        ref={box}
        className="screen-page-viewport"
        style={
          enabled && !manualScroll && !layout.fit && layout.height
            ? {
                height: visibleHeight,
                marginBottom: layout.height - visibleHeight,
              }
            : undefined
        }
        onFocusCapture={reveal}
        onInvalidCapture={reveal}
      >
        <div ref={content} className="screen-page-content">
          {children}
        </div>
        {enabled && !manualScroll && !layout.fit && layout.tail > 0 && (
          <div aria-hidden="true" style={{ height: layout.tail }} />
        )}
      </div>
      {enabled && !manualScroll && !layout.fit && paging && (
        <nav className="screen-page-controls" aria-label="Ekran sayfaları">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={18} /> Önceki
          </button>
          <span role="status" aria-live="polite">
            {current + 1} / {layout.offsets.length}
          </span>
          <button
            type="button"
            disabled={current === layout.offsets.length - 1}
            onClick={() => setPage(current + 1)}
          >
            Sonraki <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </div>
  );
}

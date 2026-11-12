"use client";

import { useEffect, useRef, useState } from "react";

type MapConfig = {
  key: string;
  securityCode: string;
  location: { name: string; longitude: number; latitude: number };
};

type AMapWindow = Window & {
  _AMapSecurityConfig?: { securityJsCode: string };
  AMap?: {
    Map: new (container: HTMLElement, options: object) => { add(marker: object): void };
    Marker: new (options: object) => object;
  };
};

export function PortalMap() {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/portal/map");
        const data = (await response.json()) as MapConfig & { error?: string };
        if (!response.ok) throw new Error(data.error || "地图暂时不可用。");
        if (cancelled || !container.current) return;

        const mapWindow = window as AMapWindow;
        if (data.securityCode) {
          mapWindow._AMapSecurityConfig = { securityJsCode: data.securityCode };
        }
        const script = document.createElement("script");
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(data.key)}`;
        script.async = true;
        script.onload = () => {
          if (cancelled || !container.current || !mapWindow.AMap) return;
          const position = [data.location.longitude, data.location.latitude];
          const map = new mapWindow.AMap.Map(container.current, { zoom: 12, center: position });
          map.add(new mapWindow.AMap.Marker({ position, title: data.location.name }));
        };
        script.onerror = () => setError("地图资源加载失败。");
        document.head.appendChild(script);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "地图暂时不可用。");
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="portal-map-wrap">
      <div className="portal-map" ref={container} aria-label="公开地点地图" />
      {error && <p className="portal-map-status">{error}</p>}
    </div>
  );
}

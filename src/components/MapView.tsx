"use client";

import { Fragment, useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { AppPhase, DemoRoute, LatLng, RouteId } from "@/lib/types";
import {
  HOME,
  LEVEL_LABEL,
  LIBRARY,
  MAP_CENTER,
  MAP_ZOOM,
  SENSORS,
} from "@/lib/demo/data";

import "leaflet/dist/leaflet.css";

function placeIcon(kind: "home" | "library") {
  const label = kind === "home" ? "自宅" : "図書館";
  const fill = kind === "home" ? "#1e3a36" : "#1f7a66";
  const html = `<div class="place-marker" style="--pin:${fill}">
      <span class="place-marker__pin"></span>
      <span class="place-marker__label">${label}</span>
    </div>`;
  return L.divIcon({
    className: "place-marker-wrap",
    html,
    iconSize: [72, 44],
    iconAnchor: [12, 34],
  });
}

function youIcon() {
  return L.divIcon({
    className: "you-marker-wrap",
    html: `<div class="you-marker" aria-hidden="true"><span></span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function routeLabelIcon(name: string, color: string) {
  return L.divIcon({
    className: "route-label-wrap",
    html: `<span class="route-label" style="--c:${color}">${name}</span>`,
    iconSize: [108, 26],
    iconAnchor: [54, 13],
  });
}

function midpoint(path: LatLng[]): LatLng {
  const i = Math.max(1, Math.floor(path.length * 0.45));
  return path[i] ?? path[0];
}

function SetupMap({ demo }: { demo: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.createPane("noisePane");
    const noise = map.getPane("noisePane");
    if (noise) noise.style.zIndex = "350";
    map.createPane("routeBack");
    const back = map.getPane("routeBack");
    if (back) back.style.zIndex = "400";
    map.createPane("routeFront");
    const front = map.getPane("routeFront");
    if (front) front.style.zIndex = "450";
    if (demo) {
      map.setView([MAP_CENTER.lat, MAP_CENTER.lng], MAP_ZOOM, { animate: false });
    }
  }, [map, demo]);
  return null;
}

type Props = {
  routes: DemoRoute[];
  selectedId: RouteId;
  phase: AppPhase;
  traveler: LatLng | null;
  demo: boolean;
};

export default function MapView({ routes, selectedId, phase, traveler, demo }: Props) {
  const showRoutes = phase !== "idle" && phase !== "searching";

  return (
    <MapContainer
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={MAP_ZOOM}
      className="h-full w-full"
      zoomControl={true}
      attributionControl={true}
      keyboard={true}
    >
      <SetupMap demo={demo} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showRoutes &&
        routes.map((route) => {
          const active = route.id === selectedId;
          const positions = route.path.map((p) => [p.lat, p.lng] as [number, number]);
          return (
            <Fragment key={route.id}>
              <Polyline
                pane={active ? "routeFront" : "routeBack"}
                positions={positions}
                pathOptions={{
                  color: "#ffffff",
                  weight: active ? 14 : 9,
                  opacity: active ? 1 : 0.8,
                  lineJoin: "round",
                  lineCap: "round",
                }}
              />
              <Polyline
                pane={active ? "routeFront" : "routeBack"}
                positions={positions}
                pathOptions={{
                  color: route.color,
                  weight: active ? 8 : 5,
                  opacity: active ? 1 : 0.78,
                  dashArray: route.dashArray || undefined,
                  lineJoin: "round",
                  lineCap: "round",
                }}
              />
              <Marker
                position={[midpoint(route.path).lat, midpoint(route.path).lng]}
                icon={routeLabelIcon(route.name, route.color)}
                interactive={false}
              />
            </Fragment>
          );
        })}

      <Marker position={[HOME.lat, HOME.lng]} icon={placeIcon("home")}>
        <Popup>{HOME.name}</Popup>
      </Marker>

      {showRoutes && (
        <Marker position={[LIBRARY.lat, LIBRARY.lng]} icon={placeIcon("library")}>
          <Popup>
            {LIBRARY.name}
            <br />
            デモ用の目的地です
          </Popup>
        </Marker>
      )}

      {showRoutes &&
        SENSORS.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={5}
            pathOptions={{
              color: "#fff",
              weight: 1.5,
              fillColor: s.level === "low" ? "#1f7a66" : s.level === "high" ? "#d4524a" : "#d8891a",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <p className="font-semibold">{s.name}</p>
              <p>騒音スコア：{s.score}</p>
              <p>レベル：{LEVEL_LABEL[s.level]}</p>
              <p>主な音：{s.sound}</p>
              <p>デモ用推定値</p>
            </Popup>
          </CircleMarker>
        ))}

      {traveler && (phase === "navigate" || phase === "arrived") && (
        <Marker position={[traveler.lat, traveler.lng]} icon={youIcon()} zIndexOffset={800}>
          <Popup>現在地（デモ）</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

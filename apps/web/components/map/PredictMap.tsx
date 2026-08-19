"use client";

import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  lat: number;
  lng: number;
  address?: string;
}

export default function PredictMap({ lat, lng, address }: Props) {
  return (
    <div className="mt-6 rounded-md border border-ink/10 bg-paper overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <p className="eyebrow">Property Location</p>
        {address && (
          <p className="mt-1 text-sm text-ink/60">{address}</p>
        )}
      </div>

      <div className="h-[350px] w-full">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Property marker */}
          <CircleMarker
            center={[lat, lng]}
            radius={10}
            pathOptions={{ color: "#20211d", fillColor: "#a85f43", fillOpacity: 1, weight: 3 }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>🏠 Property Location</strong>
                <p style={{ margin: "4px 0", fontSize: 12, color: "#666" }}>
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>
      </div>
    </div>
  );
}

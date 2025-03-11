"use client";

import { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FacilityMarker({ facility, position }: { facility: any; position: [number, number] }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [customIcon, setCustomIcon] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("leaflet").then((L) => {
                const redIcon = new L.Icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                    iconSize: [25, 41], // Default marker size
                    iconAnchor: [12, 41], // Aligns marker correctly
                    popupAnchor: [1, -34], // Adjusts popup position
                });
                setCustomIcon(redIcon);
            });
        }
    }, []);

    return (
        customIcon && (
            <Marker key={facility.id} position={position} icon={customIcon}>
                <Popup>
                    <strong>{facility.name}</strong>
                    <br />
                    {facility.address}, {facility.city}, {facility.state} {facility.zipcode}
                </Popup>
            </Marker>
        )
    );
}

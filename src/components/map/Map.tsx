"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Facility } from "@lib/schemas/facility-schema";
import FacilityMarker from "./FacilityMarker";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

export default function Map({ facilities }: { facilities: Facility[] }) {
    const [locations, setLocations] = useState<Record<number, { lat: number; lon: number }>>({});

    useEffect(() => {
        const fetchCoordinates = async () => {
            const updatedLocations: Record<number, { lat: number; lon: number }> = {};

            for (const facility of facilities) {
                const address = `${facility.address}, ${facility.city}, ${facility.state}, ${facility.zipcode}`;
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
                );
                const data = await response.json();

                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    updatedLocations[facility.id!] = { lat, lon };
                }
            }

            setLocations(updatedLocations);
        };

        fetchCoordinates();
    }, [facilities]);

    const mapCenter = useMemo(() => {
        const firstFacility = facilities.find((f) => locations[f.id!]);
        return firstFacility ? [locations[firstFacility.id!].lat, locations[firstFacility.id!].lon] : [33.4484, -112.074];
    }, [locations, facilities]);

    function SetViewOnChange({ center }: { center: [number, number] }) {
        const map = useMap();
        map.setView(center);
        map.setZoom(10);
        return null;
    }

    return (
        <MapContainer style={{ height: "100%", width: "100%" }}>
            <SetViewOnChange center={mapCenter as [number, number]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {facilities.map(
                (facility) =>
                    locations[facility.id!] && (
                        <FacilityMarker key={facility.id} facility={facility} position={[locations[facility.id!].lat, locations[facility.id!].lon]} />
                    )
            )}
        </MapContainer>
    );
}

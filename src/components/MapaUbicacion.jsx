import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import icono from "leaflet/dist/images/marker-icon.png";
import iconoSombra from "leaflet/dist/images/marker-shadow.png";

const iconoMarcador = new L.Icon({
    iconUrl: icono,
    shadowUrl: iconoSombra,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function SeleccionarUbicacion({ posicion, setPosicion }) {

    useMapEvents({
        click(evento) {
            setPosicion([
                evento.latlng.lat,
                evento.latlng.lng
            ]);
        }
    });

    return posicion ? (
        <Marker
            position={posicion}
            icon={iconoMarcador}
        />
    ) : null;
}

function MapaUbicacion({ posicion, setPosicion }) {

    const posicionInicial = [-17.393384, -66.157632];

    return (
        <MapContainer
            center={posicion || posicionInicial}
            zoom={15}
            style={{
                width: "100%",
                height: "400px"
            }}
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <SeleccionarUbicacion
                posicion={posicion}
                setPosicion={setPosicion}
            />

        </MapContainer>
    );
}

export default MapaUbicacion;
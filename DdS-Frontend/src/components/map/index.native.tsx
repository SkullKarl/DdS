import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";

import { RutaService } from "../../services/RutaService";
import { getCoordinatesFromAddress } from "../../api/gocodingApi";
import { getDirections } from "../../api/directionsApi";

type Props = { envioId: string };

export default function Map({ envioId }: Props) {
    const [myLocation, setMyLocation] = useState<{
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    } | null>(null);

    const [direccionCoords, setDireccionCoords] = useState<
        { direccion: string; latitude: number; longitude: number }[]
    >([]);

    const [routeCoords, setRouteCoords] = useState<
        { latitude: number; longitude: number }[]
    >([]);

    // obtener ubicacion actual
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setMyLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        })();
    }, []);

    // obtener direcciones de envio
    useEffect(() => {
        const fetchDirecciones = async () => {
            if (!envioId) return;

            try {
                const direcciones = await RutaService.getDirections(envioId);
                const coordenadas = await Promise.all(
                    direcciones.map(async (direccion) => {
                        const coords = await getCoordinatesFromAddress(direccion);
                        return {
                            direccion,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                        };
                    })
                );
                setDireccionCoords(coordenadas);
            } catch (error) {
                console.error("Error fetching direcciones:", error);
            }
        };

        fetchDirecciones();
    }, [envioId]);

    // obtener la ruta optimizada
    useEffect(() => {
        const fetchRoute = async () => {
            if (!myLocation || direccionCoords.length === 0) return;

            try {
                const waypoints = direccionCoords.map(coord => `${coord.longitude},${coord.latitude}`);
                const startPoint = `${myLocation.longitude},${myLocation.latitude}`;

                const routeData = await getDirections(startPoint, waypoints);

                if (routeData && routeData.routes && routeData.routes.length > 0) {
                    const geometry = routeData.routes[0].geometry;
                    const coords = polyline.decode(geometry).map(([lat, lng]) => ({
                        latitude: lat,
                        longitude: lng,
                    }));
                    setRouteCoords(coords);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            }
        };

        fetchRoute();
    }, [myLocation, direccionCoords]);

    if (!myLocation) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                {/* Loading indicator or message */}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <MapView style={styles.map} region={myLocation}>
                {/* Marcador de ubicación actual */}
                <Marker
                    coordinate={{
                        latitude: myLocation.latitude,
                        longitude: myLocation.longitude,
                    }}
                    title="Mi ubicación"
                    pinColor="blue"
                />

                {/* Marcadores de destinos */}
                {direccionCoords.map((coord, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: coord.latitude,
                            longitude: coord.longitude,
                        }}
                        title={`Destino ${index + 1}`}
                        description={coord.direccion}
                        pinColor="red"
                    />
                ))}

                {/* Ruta optimizada */}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#007AFF"
                        strokeWidth={3}
                    />
                )}
            </MapView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

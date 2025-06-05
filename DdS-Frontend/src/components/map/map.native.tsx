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
        let sub: Location.LocationSubscription;
        const start = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permisos de ubicación no otorgados");
                return;
            }

            sub = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (loc) =>
                    setMyLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    })
            );
        };
        start();
        return () => sub?.remove();
    }, []);

    // cargar ruta y calcular la polyline
    useEffect(() => {
        if (!envioId || !myLocation) return;

        const cargarRuta = async () => {
            try {
                const directions = await RutaService.getDirections(envioId);
                const coordsList = await Promise.all(
                    directions.map(getCoordinatesFromAddress)
                );

                const validCoords = coordsList
                    .map((coord, index) =>
                        coord
                            ? {
                                direccion: directions[index],
                                latitude: coord.latitude,
                                longitude: coord.longitude,
                            }
                            : null
                    )
                    .filter(
                        (
                            item
                        ): item is {
                            direccion: string;
                            latitude: number;
                            longitude: number;
                        } => !!item
                    );

                if (validCoords.length === 0) {
                    console.warn("no hay puntos de referencia validps");
                    return;
                }

                setDireccionCoords(validCoords);

                const origen = myLocation;
                const destino = validCoords[validCoords.length - 1];
                const intermedios = validCoords.slice(0, validCoords.length - 1).map(({ latitude, longitude }) => ({ latitude, longitude }));

                const result = await getDirections(origen, destino, intermedios);

                if (result.routes?.length) {
                    const points = polyline.decode(result.routes[0].overview_polyline.points);
                    const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
                    setRouteCoords(coords);
                } else {
                    console.warn("error al obtener la ruta");
                }
            } catch (err) {
                console.warn("error cargando la ruta o al calcular la direccion:", err);
            }
        };

        cargarRuta();
    }, [envioId, myLocation]);

    return (
        <SafeAreaView style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={myLocation}
                showsUserLocation
                showsMyLocationButton
            >
                {direccionCoords.map((m, i) => (
                    <Marker
                        key={i}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        title={m.direccion ?? ""}
                        pinColor="red"
                    />
                ))}

                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#007AFF" />
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
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
});

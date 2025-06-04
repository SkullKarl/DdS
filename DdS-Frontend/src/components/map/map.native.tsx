import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React from "react";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import { getDirections } from "../../api/directionsApi";
import { getCoordinatesFromAddress } from "../../api/gocodingApi";
import { supabase } from "../../api/supabaseConfig";

export default function Map() {
    const [myLocation, setMyLocation] = React.useState(null);
    const [routeCoords, setRouteCoords] = React.useState([]);
    const [waypoints, setWaypoints] = React.useState([]);

    React.useEffect(() => {
        const fetchAddressesFromDB = async () => {
            try {
                const { data, error } = await supabase
                    .from("paquete")
                    .select("direccion_entrega")
                    .not("direccion_entrega", "is", null);

                if (error) throw error;

                const addresses = data.map(item => item.direccion_entrega);

                const coordsList = await Promise.all(
                    addresses.map(async (address) => {
                        const coord = await getCoordinatesFromAddress(address);
                        return coord ? { latitude: coord.latitude, longitude: coord.longitude } : null;
                    })
                );

                const validCoords = coordsList.filter(Boolean);
                setWaypoints(validCoords);
            } catch (error) {
                console.warn("No se obtuvieron las direcciones:", error);
            }
        };

        fetchAddressesFromDB();
    }, []);

    React.useEffect(() => {
        let locationSubscription;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.warn("Permisos de ubicación denegados");
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                async (location) => {
                    const updatedLocation = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };

                    setMyLocation(updatedLocation);

                    if (waypoints.length >= 1) {
                        const destination = waypoints[waypoints.length - 1];
                        const intermediate = waypoints.slice(0, -1);

                        try {
                            const data = await getDirections(updatedLocation, destination, intermediate);
                            if (data.routes && data.routes.length > 0) {
                                const points = polyline.decode(data.routes[0].overview_polyline.points);
                                const coords = points.map(([lat, lng]) => ({
                                    latitude: lat,
                                    longitude: lng,
                                }));
                                setRouteCoords(coords);
                            }
                        } catch (error) {
                            console.warn("Error obteniendo la ruta:", error);
                        }
                    }
                }
            );
        };

        startTracking();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, [waypoints]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={myLocation}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {waypoints.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={point}
                        title={`Punto ${index + 1}`}
                        pinColor="red"
                    />
                ))}

                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                        strokeColor="#007AFF"
                    />
                )}
            </MapView>
        </View>
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

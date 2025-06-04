import { Dimensions, StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import React from "react";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import { getDirections } from "../../api/directionsApi";

export default function Map() {
    const [myLocation, setMyLocation] = React.useState(null);
    const [routeCoords, setRouteCoords] = React.useState([]);

    // puntos de entrega
    const waypoints = [
        { latitude: -36.824000, longitude: -73.046500 },
        { latitude: -36.823000, longitude: -73.045000 },
        { latitude: -36.820135, longitude: -73.044392 },
        { latitude: -36.819000, longitude: -73.043000 },
        { latitude: -36.817000, longitude: -73.041000 },
    ];

    React.useEffect(() => {
        let locationSubscription: Location.LocationSubscription;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
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
            );
        };

        startTracking();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={myLocation}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {/* marcadores de los puntos */}
                {waypoints.map((point, index) => (
                    <Marker
                        key={index}
                        coordinate={point}
                        title={`Punto ${index + 1}`}
                        pinColor="red"
                    />
                ))}

                {/* Ruta */}
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
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
});

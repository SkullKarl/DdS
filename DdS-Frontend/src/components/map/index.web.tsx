import React from 'react';
import { View, Text } from 'react-native';

type Props = { envioId: string };

export default function Map({ envioId }: Props) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>El mapa no está disponible en la web por ahora.</Text>
            {envioId && (
                <Text style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                    Envío en tránsito: {envioId}
                </Text>
            )}
        </View>
    );
}

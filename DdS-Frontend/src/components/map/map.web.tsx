import React from 'react';
import { View, Text } from 'react-native';

type Props = { envioId: string };

export default function Map({ envioId }: Props) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>El mapa no está disponible en la web por ahora.</Text>
            <Text>ID del envío: {envioId}</Text>
        </View>
    );
}

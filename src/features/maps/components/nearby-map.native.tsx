import { theme } from '@/shared/theme';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import type { NearbyMapProps } from '@/features/maps/types/nearby-map.types';

export default function NearbyMap({ latitude, longitude, psychologists, primaryColor }: NearbyMapProps) {
  return (
    <MapView
      accessibilityLabel="Mapa de psicologos proximos"
      initialRegion={{ latitude, longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
      mapType="standard"
      loadingBackgroundColor={theme.colors.mapLoading}
      loadingEnabled
      showsMyLocationButton
      showsUserLocation
      style={styles.map}>
      {psychologists.map((psychologist) => (
        <Marker
          coordinate={psychologist}
          key={psychologist.id}
          pinColor={primaryColor}
          title={psychologist.name}
          description={psychologist.specialty}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});

import { onAuthStateChanged, type User } from 'firebase/auth';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MobileFrame, useAccessiblePalette } from '@/components/mobile-shell';
import NearbyMap from '@/components/nearby-map';
import type { NearbyMapPsychologist } from '@/components/nearby-map.types';
import { getAuthErrorMessage, getUserName, signOutUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { readActivityHistory, type ActivityHistory } from '@/lib/activity';

const team = [
  { name: 'Saymon Palermo Martins', image: require('../../assets/images/consattentia/eu.jpg') },
  { name: 'Lucas Ricardo do Nascimento', image: require('../../assets/images/consattentia/lucasserio.jpg') },
  { name: 'Giovani Leon de Melo', image: require('../../assets/images/consattentia/giovanni.jpg') },
];

const tests = [
  { title: 'Tohe', description: 'Organize cenas e forme uma historia em sequencia.', image: require('../../assets/images/consattentia/pose.png'), available: true },
  { title: 'Bloquadom', description: 'Observe, memorize e encontre a sequencia correta.', image: require('../../assets/images/consattentia/fita.png'), available: false },
];

type Psychologist = NearbyMapPsychologist;

async function findNearbyPsychologists(latitude: number, longitude: number): Promise<Psychologist[]> {
  const query = `[out:json][timeout:15];(nwr["healthcare"="psychologist"](around:15000,${latitude},${longitude});nwr["office"="psychologist"](around:15000,${latitude},${longitude}););out center tags;`;
  const headers = { Accept: 'application/json', 'User-Agent': 'ConsAttentia/1.0 (educational app)' };
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { headers });
      if (!response.ok) continue;
          const data = (await response.json()) as { elements?: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[] };
      const results = (data.elements ?? []).flatMap((element) => {
    const point = element.lat !== undefined && element.lon !== undefined ? { latitude: element.lat, longitude: element.lon } : element.center ? { latitude: element.center.lat, longitude: element.center.lon } : null;
    if (!point) return [];
    return [{ id: String(element.id), name: element.tags?.name ?? 'Psicólogo próximo', specialty: element.tags?.['healthcare:speciality'] ?? 'Psicologia', ...point }];
      });
      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=20&q=psychologist%20near%20${latitude},${longitude}`, { headers });
  if (!nominatimResponse.ok) return [];
  const places = (await nominatimResponse.json()) as { place_id: number; display_name: string; lat: string; lon: string }[];
  return places.map((place) => ({ id: String(place.place_id), name: place.display_name.split(',')[0] || 'Psicólogo próximo', specialty: 'Psicologia', latitude: Number(place.lat), longitude: Number(place.lon) }));
}

function distanceInKilometers(from: Location.LocationObject['coords'], to: { latitude: number; longitude: number }) {
  const earthRadius = 6371;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const latitudeFrom = (from.latitude * Math.PI) / 180;
  const latitudeTo = (to.latitude * Math.PI) / 180;
  const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeFrom) * Math.cos(latitudeTo) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [testsOpen, setTestsOpen] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationMessage, setLocationMessage] = useState('Buscando sua localizacao...');
  const [nearbyPsychologists, setNearbyPsychologists] = useState<Psychologist[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory>(Array(24).fill(0));
  const palette = useAccessiblePalette();

  useEffect(() => {
    if (!auth) {
      router.replace('/');
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) router.replace('/');
    });
  }, []);

  useEffect(() => {
    const refreshActivity = () => {
      readActivityHistory().then(setActivityHistory);
    };
    refreshActivity();
    const interval = setInterval(refreshActivity, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (mounted) setLocationMessage('Ative a localizacao do aparelho para encontrar psicologos proximos.');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        if (mounted) setLocationMessage('Permita o acesso a localizacao para ver os psicologos proximos.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced });
      if (mounted) {
        setLocation(currentLocation);
        setLocationMessage('');
        findNearbyPsychologists(currentLocation.coords.latitude, currentLocation.coords.longitude)
          .then((items) => {
            if (mounted) setNearbyPsychologists(items);
          })
          .catch(() => {
            if (mounted) setLocationMessage('Nao foi possivel carregar psicologos proximos agora.');
          });
      }
    }

    loadLocation().catch(() => {
      if (mounted) setLocationMessage('Nao foi possivel obter sua localizacao agora.');
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOutUser();
      router.replace('/');
    } catch (error) {
      Alert.alert('Nao foi possivel sair', getAuthErrorMessage(error));
    }
  }

  return (
    <MobileFrame onLogout={handleSignOut}>
      <View style={[styles.dashboardHero, { backgroundColor: palette.primary }]}>
        <View style={styles.heroTop}>
          <View><Text style={styles.welcome}>Bem Vindo</Text><Text style={styles.userLabel}>{user ? getUserName(user) : 'Usuario'}</Text></View>
          <View style={styles.avatar}><View style={styles.avatarHead} /><View style={styles.avatarBody} /></View>
        </View>
        <Text style={styles.activityTitle}>Atividade recente</Text>
        <ActivityGraph history={activityHistory} />
      </View>

      <View style={[styles.section, styles.aboutSection]}>
        <Text style={[styles.sectionTitle, { color: palette.accent }]}>Encontre Psicologos proximos</Text>
        <View style={styles.mapPlaceholder}>
          <NearbyMap
            latitude={location?.coords.latitude ?? -22.8583}
            longitude={location?.coords.longitude ?? -47.22}
            primaryColor={palette.primary}
            psychologists={nearbyPsychologists}
          />
        </View>
        {locationMessage ? <Text style={[styles.locationMessage, { color: palette.muted }]}>{locationMessage}</Text> : null}
        {location && nearbyPsychologists.length > 0 ? (
          <ScrollView contentContainerStyle={styles.nearbyList} horizontal showsHorizontalScrollIndicator={false}>
            {nearbyPsychologists.map((psychologist) => (
              <View key={psychologist.id} style={[styles.nearbyCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Text style={[styles.nearbyName, { color: palette.text }]}>{psychologist.name}</Text>
                <Text style={[styles.nearbySpecialty, { color: palette.muted }]}>{psychologist.specialty}</Text>
                <Text style={[styles.nearbyDistance, { color: palette.primary }]}>{distanceInKilometers(location.coords, psychologist).toFixed(1)} km de voce</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
        {location && !locationMessage && nearbyPsychologists.length === 0 ? <Text style={[styles.locationMessage, { color: palette.muted }]}>Nenhum psicologo cadastrado foi encontrado nesta area.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.accent }]}>Sobre Nos</Text>
        <ScrollView contentContainerStyle={styles.profiles} horizontal showsHorizontalScrollIndicator={false}>
          {team.map((member) => <View key={member.name} style={styles.profile}><Image accessibilityLabel={`Foto de ${member.name}`} source={member.image} style={styles.profileImage} /><Text style={[styles.profileName, { color: palette.accent }]}>{member.name}</Text></View>)}
        </ScrollView>
      </View>

      <View style={styles.homeActions}>
        <Pressable accessibilityRole="button" onPress={() => setTestsOpen(true)} style={[styles.testsButton, { backgroundColor: palette.primary }]}><Text style={styles.testsButtonText}>Testes</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir testes" onPress={() => setTestsOpen(true)} style={[styles.testsMenu, { backgroundColor: palette.primary }]}><Text style={styles.testsMenuText}>≡</Text></Pressable>
      </View>
      <TestsSheet visible={testsOpen} onClose={() => setTestsOpen(false)} palette={palette} />
    </MobileFrame>
  );
}

function ActivityGraph({ history }: { history: ActivityHistory }) {
  const maxValue = Math.max(1, ...history);
  const barHeights = history.map((value) => Math.max(4, (value / maxValue) * 58));
  return <View style={styles.graph}>
    {[0, 1, 2, 3].map((line) => <View key={line} style={[styles.graphLine, { top: line * 17 }]} />)}
    <View style={styles.graphBars}>
      {barHeights.map((height, index) => <View key={`${index}-${height}`} style={[styles.graphBar, { height }]} />)}
    </View>
    <View style={styles.graphLabels}>{['24h', '20h', '16h', '12h', '8h', '4h', 'agora'].map((label) => <Text key={label} style={styles.graphLabel}>{label}</Text>)}</View>
  </View>;
}

function TestsSheet({ visible, onClose, palette }: { visible: boolean; onClose: () => void; palette: ReturnType<typeof useAccessiblePalette> }) {
  return <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
    <View style={styles.sheetRoot}>
      <Pressable accessibilityLabel="Fechar testes" onPress={onClose} style={styles.sheetScrim} />
      <View style={[styles.testSheet, { backgroundColor: palette.background }]}>
        <View style={[styles.sheetHandle, { backgroundColor: palette.border }]} />
        <View style={styles.sheetHeading}>
          <View><Text style={[styles.sheetEyebrow, { color: palette.primary }]}>CONSATTENTIA</Text><Text style={[styles.sheetTitle, { color: palette.text }]}>Escolha seu teste</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={[styles.closeButton, { borderColor: palette.border }]}><Text style={[styles.closeText, { color: palette.text }]}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.testList} showsVerticalScrollIndicator={false}>
          {tests.map((test) => <View key={test.title} style={[styles.testCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Image accessibilityLabel={test.title} resizeMode="contain" source={test.image} style={styles.testImage} />
            <View style={styles.testCopy}><Text style={[styles.testTitle, { color: palette.text }]}>{test.title}</Text><Text style={[styles.testDescription, { color: palette.muted }]}>{test.description}</Text>
              <Pressable accessibilityRole="button" disabled={!test.available} onPress={() => { onClose(); router.push('/tohe'); }} style={[styles.testAction, { backgroundColor: test.available ? palette.primary : palette.border }]}><Text style={[styles.testActionText, !test.available && { color: palette.muted }]}>{test.available ? 'Iniciar teste' : 'Em breve'}</Text></Pressable>
            </View>
          </View>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  dashboardHero: { marginHorizontal: -20, marginTop: -22, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, welcome: { color: '#FFFFFF', fontSize: 26, lineHeight: 32, fontWeight: '400' }, userLabel: { color: '#E2F0ED', fontSize: 14 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#E5E7E5', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }, avatarHead: { position: 'absolute', top: 10, width: 16, height: 16, borderRadius: 8, backgroundColor: '#969996' }, avatarBody: { width: 34, height: 18, borderRadius: 18, backgroundColor: '#969996', marginBottom: 5 },
  activityTitle: { marginTop: 20, color: '#DFF1EB', fontSize: 14 }, graph: { height: 100, marginTop: 8, position: 'relative' }, graphLine: { position: 'absolute', left: 12, right: 4, height: 1, backgroundColor: 'rgba(255,255,255,0.55)' }, graphLabels: { position: 'absolute', left: 7, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' }, graphLabel: { color: '#DFF1EB', fontSize: 8 },
  graphBars: { position: 'absolute', left: 12, right: 4, bottom: 20, height: 60, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', opacity: 0.9 }, graphBar: { width: 4, borderRadius: 3, backgroundColor: '#B7F23A' },
  section: { gap: 8 }, aboutSection: { alignItems: 'center', gap: 6 }, sectionTitle: { fontSize: 13, fontWeight: '500' }, mapPlaceholder: { height: 132, borderRadius: 7, overflow: 'hidden', backgroundColor: '#A8B0A5' }, map: { flex: 1 }, locationMessage: { fontSize: 11, lineHeight: 16, textAlign: 'center' }, nearbyList: { gap: 8, paddingRight: 20 }, nearbyCard: { width: 170, minHeight: 86, borderWidth: 1, borderRadius: 8, padding: 10, gap: 4 }, nearbyName: { fontSize: 12, fontWeight: '700' }, nearbySpecialty: { fontSize: 10, lineHeight: 14 }, nearbyDistance: { fontSize: 11, fontWeight: '700' }, profiles: { gap: 12, paddingHorizontal: 4 }, profile: { width: 118, alignItems: 'center', gap: 5 }, profileImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#C7D2D3' }, profileName: { fontSize: 11, lineHeight: 15, textAlign: 'center' },
  homeActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: -2 }, testsButton: { minWidth: 70, minHeight: 36, paddingHorizontal: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, testsButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' }, testsMenu: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, testsMenuText: { color: '#FFFFFF', fontSize: 27, lineHeight: 27 },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' }, sheetScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(12,32,35,0.55)' }, testSheet: { maxHeight: '86%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, overflow: 'hidden' }, sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginBottom: 8 }, sheetHeading: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sheetEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1 }, sheetTitle: { marginTop: 4, fontSize: 23, fontWeight: '700' }, closeButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, closeText: { fontSize: 24, lineHeight: 27 }, testList: { gap: 12, padding: 20, paddingTop: 4, paddingBottom: 32 }, testCard: { minHeight: 156, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 12 }, testImage: { width: 116, height: 116, borderRadius: 8 }, testCopy: { flex: 1, justifyContent: 'center', gap: 6 }, testTitle: { fontSize: 20, fontWeight: '700' }, testDescription: { fontSize: 12, lineHeight: 17 }, testAction: { minHeight: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }, testActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});

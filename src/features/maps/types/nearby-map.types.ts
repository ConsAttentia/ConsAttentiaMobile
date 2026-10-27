export interface NearbyMapPsychologist {
  id: string;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
}

export interface NearbyMapProps {
  latitude: number;
  longitude: number;
  psychologists: NearbyMapPsychologist[];
  primaryColor: string;
}

export type NearbyMapPsychologist = {
  id: string;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
};

export type NearbyMapProps = {
  latitude: number;
  longitude: number;
  psychologists: NearbyMapPsychologist[];
  primaryColor: string;
};

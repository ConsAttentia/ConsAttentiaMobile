import { ToheGame, type ToheStage } from '@/components/tohe-game';

const stages: readonly ToheStage[] = [
  {
    label: 'Fácil',
    pieces: [
      { id: 'facil1', image: require('../../assets/images/activities/facil1.jpeg'), label: 'Cena 1' },
      { id: 'facil2', image: require('../../assets/images/activities/facil2.jpeg'), label: 'Cena 2' },
      { id: 'facil3', image: require('../../assets/images/activities/facil3.jpeg'), label: 'Cena 3' },
    ],
  },
  {
    label: 'Médio',
    pieces: [
  { id: 'principal1', image: require('../../assets/images/consattentia/principal1.jpg'), label: 'Cena 1' },
  { id: 'principal2', image: require('../../assets/images/consattentia/principal2.jpg'), label: 'Cena 2' },
  { id: 'principal3', image: require('../../assets/images/consattentia/principal3.jpg'), label: 'Cena 3' },
  { id: 'principal4', image: require('../../assets/images/consattentia/principal4.jpg'), label: 'Cena 4' },
    ],
  },
  {
    label: 'Difícil',
    placeholderImage: require('../../assets/images/consattentia/pose.png'),
  },
];

export default function ToheScreen() {
  return <ToheGame stages={stages} />;
}

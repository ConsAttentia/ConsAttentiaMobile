import { ToheGame, type ToheStage } from '@/features/tests/tohe/components/tohe-game';

const stages: readonly ToheStage[] = [
  {
    id: 'facil',
    label: 'Fácil',
    stories: [
      {
        id: 'cartas',
        label: 'Cartas',
        pieces: [
          { id: 'carta1', image: require('../../assets/images/consattentia/carta1.jpg'), label: 'Cena 1' },
          { id: 'carta2', image: require('../../assets/images/consattentia/carta2.jpg'), label: 'Cena 2' },
          { id: 'carta3', image: require('../../assets/images/consattentia/carta3.jpg'), label: 'Cena 3' },
        ],
      },
      {
        id: 'idosa',
        label: 'Idosa',
        pieces: [
          { id: 'idosa1', image: require('../../assets/images/consattentia/Idosa1.jpg'), label: 'Cena 1' },
          { id: 'idosa2', image: require('../../assets/images/consattentia/Idosa2.jpg'), label: 'Cena 2' },
          { id: 'idosa3', image: require('../../assets/images/consattentia/Idosa3.jpg'), label: 'Cena 3' },
        ],
      },
      {
        id: 'baby',
        label: 'Bebê',
        pieces: [
          { id: 'baby1', image: require('../../assets/images/consattentia/Baby1.jpg'), label: 'Cena 1' },
          { id: 'baby2', image: require('../../assets/images/consattentia/Baby2.jpg'), label: 'Cena 2' },
          { id: 'baby3', image: require('../../assets/images/consattentia/Baby3.jpg'), label: 'Cena 3' },
        ],
      },
    ],
  },
  {
    id: 'medio',
    label: 'Médio',
    stories: [
      {
        id: 'cachorro',
        label: 'Cachorro',
        pieces: [
          { id: 'cachorro1', image: require('../../assets/images/consattentia/cachorro1.jpg'), label: 'Cena 1' },
          { id: 'cachorro2', image: require('../../assets/images/consattentia/cachorro2.jpg'), label: 'Cena 2' },
          { id: 'cachorro3', image: require('../../assets/images/consattentia/cachorro3.jpg'), label: 'Cena 3' },
          { id: 'cachorro4', image: require('../../assets/images/consattentia/cachorro4.jpg'), label: 'Cena 4' },
        ],
      },
      {
        id: 'louca',
        label: 'Louça',
        pieces: [
          { id: 'louca1', image: require('../../assets/images/consattentia/louça1.jpg'), label: 'Cena 1' },
          { id: 'louca2', image: require('../../assets/images/consattentia/louça2.jpg'), label: 'Cena 2' },
          { id: 'louca3', image: require('../../assets/images/consattentia/louça3.jpg'), label: 'Cena 3' },
          { id: 'louca4', image: require('../../assets/images/consattentia/louça4.jpg'), label: 'Cena 4' },
        ],
      },
    ],
  },
  {
    id: 'dificil',
    label: 'Difícil',
    stories: [
      {
        id: 'parede',
        label: 'Parede',
        pieces: [
          { id: 'parede1', image: require('../../assets/images/consattentia/parede1.jpg'), label: 'Cena 1' },
          { id: 'parede2', image: require('../../assets/images/consattentia/parede2.jpg'), label: 'Cena 2' },
          { id: 'parede3', image: require('../../assets/images/consattentia/parede3.jpg'), label: 'Cena 3' },
          { id: 'parede4', image: require('../../assets/images/consattentia/parede4.jpg'), label: 'Cena 4' },
          { id: 'parede5', image: require('../../assets/images/consattentia/parede5.jpg'), label: 'Cena 5' },
        ],
      },
    ],
  },
];

export default function ToheScreen() {
  return <ToheGame stages={stages} />;
}

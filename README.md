Integrantes:

Saymon Palermo Martins
Lucas Ricardo Do Nascimento
Giovani Leon de Melo

3DSB.

# ConsattentiaMob

Aplicativo mobile da ConsAttentia feito com Expo, React Native e Expo Router.

## Configuração

1. Crie um app Web no projeto Firebase e habilite o provedor _E-mail/senha_ em Authentication.
2. Copie `.env.example` para `.env` e preencha os valores da configuração do app Firebase.
3. Inicie o Expo:

```bash
npm install
npx expo start
```

Escaneie o QR code pelo Expo Go. O celular e o computador precisam estar na mesma rede Wi-Fi, ou inicie o Expo com `npx expo start --tunnel`.

## Funcionalidades

- Login com e-mail e senha.
- Cadastro com nome, e-mail e senha.
- Sessão persistida no dispositivo.
- Home com proposta, equipe e informações do projeto.
- Seleção de experimentos e explicação do TOHE.
- TOHE adaptado para toque: selecionar uma cena e tocar no espaço de destino.
- Preferências de paleta, espaçamento de letras e alto contraste persistidas no dispositivo.
- Saída da conta disponível nas configurações.
- Perfil com atualização de nome e senha, incluindo reautenticação da senha atual.
- Registro da atividade das últimas 24 horas para exibição do histórico de uso.
- Geração e compartilhamento de relatório de resultado em PDF.
- Experiência multiplataforma para Android, iOS e web.
- Mapa de psicólogos próximos no mobile, com uma versão compatível com web.

As paletas ajustam as cores da interface nativa; não aplicam transformação às fotografias e ilustrações.

## Tecnologias e APIs

O projeto não possui uma API REST própria. As funcionalidades são implementadas com APIs do Firebase, Expo, React Native e módulos internos TypeScript:

- **Firebase Authentication:** cadastro, login, persistência da sessão, atualização do perfil, troca de senha e logout.
- **AsyncStorage:** persistência local das preferências de acessibilidade, da sessão do Firebase e dos eventos de atividade.
- **Expo Router:** navegação baseada em arquivos dentro de `src/app`.
- **Expo Location e React Native Maps:** localização do dispositivo e visualização de psicólogos próximos no Android/iOS. A tela web usa uma implementação alternativa.
- **Expo Print e Expo Sharing:** criação do PDF e abertura do compartilhamento nativo; no web, o relatório é enviado para a impressão do navegador.
- **Expo Audio, Image, Linear Gradient e Reanimated:** recursos multimídia, imagens, identidade visual e animações da interface.

### APIs internas

As funções de domínio ficam em `src/lib` e podem ser reutilizadas pelas telas:

```ts
import { register, signIn, signOutUser } from "@/lib/auth";
import { recordActivity, readActivityHistory } from "@/lib/activity";

await register("Nome da pessoa", "pessoa@exemplo.com", "senha-segura");
await signIn("pessoa@exemplo.com", "senha-segura");

await recordActivity();
const activityByHour = await readActivityHistory(); // 24 posições, uma por hora

await signOutUser();
```

O módulo de autenticação normaliza o e-mail, atualiza o `displayName` do usuário e converte códigos comuns do Firebase em mensagens em português. A troca de senha exige reautenticação para respeitar a política de segurança do Firebase.

O componente `ToheGame` recebe as fases como dados, permitindo criar novas atividades sem alterar a lógica principal:

```ts
const stages: ToheStage[] = [
  {
    label: "Nível fácil",
    pieces: [
      { id: "inicio", label: "Início", image: images.inicio },
      { id: "fim", label: "Fim", image: images.fim },
    ],
  },
];
```

Os resultados seguem o contrato `ResultReport`, com nome do teste, duração, tentativas, pontuação, detalhes e data de geração. `shareResultPdf(report)` transforma esse contrato em HTML e usa o `expo-print`/`expo-sharing` conforme a plataforma.

O mapa recebe uma lista tipada de profissionais, sem acoplar a tela a uma fonte de dados específica:

```ts
type NearbyMapPsychologist = {
  id: string;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
};
```

Uma integração futura com uma API própria pode preencher essa lista e fornecer `latitude` e `longitude`; atualmente o componente apenas renderiza os dados recebidos.

## Configuração do Firebase

Crie um app Web no projeto Firebase, habilite o provedor **E-mail/senha** em Authentication e defina estas variáveis em `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

O Firebase só é inicializado quando `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID` e `APP_ID` estão presentes. Sem essa configuração, as telas continuam carregáveis, mas as operações de autenticação retornam um erro orientando a configurar o arquivo `.env`.

## Estrutura

```text
src/
  app/          # Rotas Expo Router
  components/   # UI de autenticação, shell e acessibilidade
  context/      # Preferências de acessibilidade compartilhadas
  lib/          # Firebase, autenticação, atividade e relatórios
assets/         # Ícones, splash e assets ConsAttentia
.vscode/        # Configurações do editor
```

## Scripts e verificações

```bash
npm run lint
npm run typecheck
npx expo-doctor
```
aprendi a usar essas corzinhas e destaques hoje :)

obrigado pela atenção e ótima noite professor!
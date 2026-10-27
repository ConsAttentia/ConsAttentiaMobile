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
- Sessão centralizada em `AuthContext` e acesso pelo hook `useAuth`, com validação e mensagens de erro em português.
- Sessão persistida no dispositivo.
- Rotas privadas aguardam a confirmação da sessão Firebase e redirecionam visitantes sem login para a autenticação.
- Home com proposta, equipe e informações do projeto.
- Seleção de experimentos e explicação do TOHE.
- TOHE adaptado para toque: imagens embaralhadas em cada fase, sem nomes visíveis nos cartões, e seleção de cena seguida do espaço de destino.
- AATS com áudio e resposta por toque, AATA com regras alternadas e ADAS com recortes visuais em três níveis.
- Preferências persistentes de paleta para daltonismo, alto contraste, espaçamento de letras, fonte alternativa e tamanho do texto.
- Redução de movimento disponível nas configurações e sincronizada com a preferência do sistema operacional.
- Saída da conta disponível nas configurações.
- Perfil com atualização de nome e senha, incluindo reautenticação da senha atual.
- Registro da atividade das últimas 24 horas para exibição do histórico de uso.
- Geração e compartilhamento de relatório de resultado em PDF.
- Histórico local de resultados por conta, com compartilhamento dos relatórios pelo perfil.
- Experiência multiplataforma para Android, iOS e web.
- Mapa de psicólogos próximos no mobile, com uma versão compatível com web.
- Ícones multiplataforma com Expo Symbols (SF Symbols no iOS e Material Symbols no Android/web).
- Fonte local Atkinson Hyperlegible opcional para leitura acessível; a fonte padrão e o desenho atual da interface são preservados.
- Tema compartilhado com paleta principal `#329667` (verde) e `#4782b2` (azul), cores de acessibilidade, tipografia, espaçamentos e dimensões.

As paletas de daltonismo ajustam as cores de interface; não aplicam transformação às fotografias e ilustrações. As opções de tamanho, fonte e espaçamento são aplicadas aos textos da interface e aos campos de entrada.

## Tecnologias e APIs

O projeto não possui uma API REST própria. As funcionalidades são implementadas com APIs do Firebase, Expo, React Native e módulos internos TypeScript:

- **Firebase Authentication:** cadastro com validação, login, persistência da sessão, atualização do perfil, troca de senha e logout. `AuthProvider` compartilha a sessão via `useAuth`.
- **AsyncStorage:** persistência local das preferências de acessibilidade, da sessão do Firebase e dos eventos de atividade.
- **Expo Router:** navegação baseada em arquivos dentro de `src/app`.
- **Expo Location e React Native Maps:** localização do dispositivo e visualização de psicólogos próximos no Android/iOS. A tela web usa uma implementação alternativa.
- **Expo Print e Expo Sharing:** criação do PDF e abertura do compartilhamento nativo; no web, o relatório é enviado para a impressão do navegador.
- **Expo Audio, Font, Image, Linear Gradient, Symbols e Reanimated:** recursos multimídia, fonte local acessível, ícones multiplataforma, imagens, identidade visual e animações da interface.

### APIs internas

Os serviços e hooks de domínio ficam junto de cada feature e podem ser reutilizados pelas telas:

```ts
import { register, signIn, signOutUser } from "@/features/auth/services/auth";
import { recordActivity, readActivityHistory } from "@/features/activity/services/activity";

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

O Firebase só é inicializado quando `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID` e `APP_ID` estão presentes. Sem essa configuração, as telas públicas de login e cadastro continuam disponíveis, mas as rotas privadas redirecionam para o login e as operações de autenticação orientam a configurar o arquivo `.env`.

A proteção de rotas no aplicativo controla a navegação no cliente. O projeto não possui API própria nem usa Firestore para armazenar os resultados; os históricos ficam no dispositivo. Se uma API ou banco de dados for integrado futuramente, cada recurso privado também deverá ser protegido no servidor por regras de autorização.

## Estrutura

```text
src/
  app/                         # Apenas as rotas do Expo Router
  features/
    accessibility/             # Preferências, contexto e componentes de acessibilidade
    activity/                  # Registro local de atividade
    auth/                      # Componentes, AuthContext, useAuth e serviços Firebase
    dashboard/                 # Navegação e estrutura visual compartilhada
    maps/                      # Mapa multiplataforma e tipos próprios
    results/                   # Relatórios, histórico e compartilhamento
    tests/tohe/                # Componentes e domínio do TOHE
  shared/
    firebase/                  # Inicialização compartilhada do Firebase
    theme/                     # Paleta, tipografia e tokens de dimensões
assets/
  fonts/                       # Atkinson Hyperlegible e licença OFL
  images/                      # Imagens da ConsAttentia e dos testes
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
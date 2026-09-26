# ConsattentiaMob

Aplicativo mobile da ConsAttentia feito com Expo, React Native e Expo Router.

## Configuração

1. Crie um app Web no projeto Firebase e habilite o provedor **E-mail/senha** em Authentication.
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

As paletas ajustam as cores da interface nativa; não aplicam transformação às fotografias e ilustrações.

## Estrutura

```text
src/
  app/          # Rotas Expo Router
  components/   # UI de autenticação, shell e acessibilidade
  context/      # Preferências de acessibilidade compartilhadas
  lib/          # Firebase e operações de autenticação
assets/         # Ícones, splash e assets ConsAttentia
.vscode/        # Configurações do editor
```

## Verificações

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor
```

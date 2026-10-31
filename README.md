# Duelo do Rio

MVP de um jogo 1v1 em React Native + Expo, pensado para rodar em modo retrato no Expo Go.

Dois duelistas ficam em margens opostas de um rio. Bichos atravessam a água e bloqueiam os tiros. Toque e arraste no lado esquerdo para mover, **ATIRAR** para disparar em linha reta e **PODER** para um tiro perfurante. O primeiro a zerar os 3 corações do rival vence.

## Rodar

```bash
npm install
npx expo start
```

Depois escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS). O projeto usa o SDK 58; se o Expo Go reclamar da versão, atualize o app na loja.

- `npx expo start --web` abre a versão web (setas/WASD movem, espaço atira, E ou Shift usa o poder).
- `npm run lint` roda o ESLint.

## Controles

- **Joystick dinâmico** (lado esquerdo): toque em qualquer ponto da metade esquerda e arraste. O joystick nasce exatamente onde o dedo tocou, calcula direção/intensidade e desaparece ao soltar.
- **Botão ATIRAR** (direita): dispara um tiro reto na coluna atual. Pode ser usado com outro dedo enquanto o joystick está pressionado.
- **Botão PODER** (ao lado do ATIRAR): tiro perfurante que atravessa bichos e tira 2 corações. Recarrega em 6 segundos.
- **Swipe** na metade direita da arena: alternativa ao joystick.
- **Web**: setas/WASD movem, espaço atira, E ou Shift usa o poder.

## Joystick dinâmico (como funciona)

1. Uma `View` invisível cobre a metade esquerda do ecrã.
2. No toque (`onTouchStart`), guardamos `locationX/locationY` como origem e o `identifier` daquele dedo. O fundo + handle aparecem nesse ponto exato.
3. No arrasto (`onTouchMove`), o vetor `pageX/pageY` é limitado a um raio máximo. A intensidade é `min(1, distância / raio)`.
4. A direção é o eixo dominante do vetor (cima, baixo, esquerda, direita). A intensidade controla o intervalo entre passos: ~230ms no toque leve e ~110ms no toque forte.
5. Ao soltar (`onTouchEnd`), o loop de passos para e o joystick desaparece.
6. O visual do joystick fica numa camada acima do dock (`pointerEvents="none"`), enquanto a área de toque fica atrás do dock (`box-none`), então os botões de tiro/poder continuam funcionando.

### Atirar enquanto se move

No nativo o joystick usa eventos de toque diretos (`onTouchStart/Move/End`) em vez de `PanResponder`. O `PanResponder` transforma a área do joystick no *responder* global do React Native, e só existe um responder por vez — por isso o segundo dedo no botão ATIRAR era ignorado. Com eventos de toque diretos, cada dedo é acompanhado pelo seu `identifier` e o `Pressable` do botão continua livre para assumir o responder. Na web o `PanResponder` é mantido como fallback para o rato.

O componente está em `src/components/DynamicJoystick.js` e expõe `onStep(direction, intensity)`.

## Regras do MVP

- Cada lado tem 3 pontos de vida.
- O tiro vai reto e não persegue o adversário.
- Bichos no rio bloqueiam tiros dos dois lados (e mudam de direção ao serem atingidos).
- O tiro **PODER** atravessa os bichos e causa 2 de dano, mas tem recarga de 6s.
- O rival tem uma IA simples: se alinha com você, desvia de tiros e atira.
- Você fica invulnerável por ~1s depois de levar um tiro.

## Estrutura

```
App.js                     entrada do app
src/GameScreen.js          tela, HUD, swipe e integração dos controles
src/game/engine.js         loop do jogo, colisões, IA, poder especial
src/game/layout.js         grid, margens e posições do mundo
src/components/            arena, sprites, overlays, joystick dinâmico e botões
```

## Próximos passos (ideias)

- Modo 2 jogadores no mesmo aparelho.
- Joystick com movimento contínuo/8 direções.
- Mais poderes e power-ups na água.
- Sons e mais feedback visual.
- Placar persistente e níveis de dificuldade da IA.
- Customização dos personagens.
# riverdual

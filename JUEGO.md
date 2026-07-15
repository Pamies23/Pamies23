# ⚡ Rayo Racer 95

Un juego de carreras casero para jugar con tu sobrino de 4 años, inspirado en el
universo de los coches de carreras con ojos. Todo el arte está dibujado con código
(sin materiales oficiales de Disney/Pixar) — es un proyecto de fans para uso familiar.

**Todo el juego es un único archivo: `index.html`.** Funciona en cualquier navegador,
pero está diseñado para iPhone/iPad: botones gigantes, acelerador automático y sin
"game over" — los choques solo frenan un poquito. Perfecto para 4 años.

---

## 🚀 Cómo ponerlo en internet (una sola vez, 2 minutos)

La forma más fácil es **GitHub Pages** (gratis):

1. Entra en el repositorio en GitHub → pestaña **Settings** → sección **Pages**.
2. En *Source* elige **Deploy from a branch**.
3. Elige la rama donde está el juego (`master` si ya lo has fusionado, o la rama
   `claude/mcqueen-racing-game-p7jfn1`) y la carpeta `/ (root)`. Guarda.
4. En 1-2 minutos tu juego estará en: **`https://pamies23.github.io/Pamies23/`**

Abre esa dirección en Safari en el iPhone y listo. 

> 💡 **Truco**: en Safari toca *Compartir → Añadir a pantalla de inicio*. Se crea un
> icono ⚡ y el juego se abre a pantalla completa como una app de verdad.

---

## 🎮 Cómo se juega

- El coche **acelera solo**. Solo hay que tocar:
  - **Lado izquierdo de la pantalla** → girar a la izquierda ⬅️
  - **Lado derecho de la pantalla** → girar a la derecha ➡️
- Recoge los **rayos ⚡** para gritar *¡KACHOW!* y salir disparado con turbo.
- Esquiva conos 🚧, ruedas 🛞… si chocas no pasa nada: un ruidito gracioso y a seguir.
- El primero en llegar a la bandera 🏁 gana. ¡Confeti y trofeo! 🏆

### 🏁 1 Jugador
Carrera contra 4 coches rivales (¡uno es una grúa marrón muy simpática!). Los rivales
"se dejan querer": si el peque se queda atrás, le esperan un poco, así casi siempre
hay emoción hasta la meta.

### 📱 2 Jugadores (dos iPhones)
Cada uno con su móvil, aunque estéis en casas distintas:

1. Los **dos móviles** abren el juego (hace falta internet en ambos).
2. Uno toca **2 Jugadores → 🔴 Crear carrera** → aparece un **código de 4 números**.
3. El otro toca **2 Jugadores → 🔵 Tengo un código** y teclea esos 4 números.
4. Cuando salga "¡Conectados! 🎉", el primero pulsa **🚦 ¡A CORRER!**
5. Semáforo, ¡y a la meta! Cada uno ve el coche del otro en su pantalla y en la
   barra de progreso. Al acabar podéis pulsar **¡Otra vez!** para la revancha.

El anfitrión corre con el **Rayo Rojo 95** y el invitado con el **Trueno Azul 24**.

---

## 🔧 Si algo no va

| Problema | Solución |
|---|---|
| No se oye nada | Toca la pantalla una vez (iPhone bloquea el sonido hasta el primer toque). Revisa el botón 🔊 del menú y el interruptor de silencio del iPhone. |
| "No encuentro esa carrera" | Comprueba el código y que el otro móvil sigue en la pantalla de espera. |
| No conecta en modo 2 jugadores | Comprueba que ambos tienen internet. Si sigue sin ir, conectad los dos a la misma WiFi. |
| El otro se desconectó a mitad | El juego avisa y te deja terminar la carrera tú solo. |
| La pantalla se apaga a mitad de carrera | El juego intenta mantenerla encendida; si no, sube el tiempo de bloqueo automático en Ajustes. |

> 💡 **Para niños de 4 años**: el *Acceso Guiado* del iPhone
> (Ajustes → Accesibilidad → Acceso Guiado) evita que salgan del juego sin querer.

---

## 🛠 Para curiosos

- `index.html` — todo el juego: motor pseudo-3D en canvas, sonidos sintetizados con
  WebAudio (no hay ficheros de audio) y arte dibujado con código + emojis.
- `peerjs.min.js` — [PeerJS](https://peerjs.com) (licencia MIT), incluido en el repo,
  conecta los dos móviles directamente entre sí (WebRTC) usando su servidor público
  gratuito solo para "presentarlos".
- `index.html?corta=1` — carrera corta de ~15 s, útil para probar.
- `index.html?peerhost=IP:PUERTO` — usar un servidor PeerJS propio en vez del público.
- En ordenador también se puede jugar con las flechas del teclado.

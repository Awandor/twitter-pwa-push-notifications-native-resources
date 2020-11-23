# Twitter offline posting con Push Notifications y Recursos Nativos del dispositivo

Este es un pequeño servidor de express listo para ejecutarse y servir la carpeta public en la web.

Recuerden que deben de reconstruir los módulos de node con el comando

`npm install`

Si existe un archivo package-lock.json es mejor borrarlo pues puede generar problemas, el archivo se
reconstruye al hacer `npm install`

Luego, para correr en producción

`npm start`

Para correr en desarrollo

`npm run dev`

La aplicación tiene ya sw y offline posting y vamos a añadir Push Notifications


## Permisos para Notificaciones Push

Las notificaciones normales salen desde el cliente y no necesitan llegar a un servicio de terceros

Estas notificaciones necesitan permiso del usuario

La parte primordial de mandar una notificación

Si hacemos click en el icono de información del sitio web en el navegador, al lado de la ruta se abre una ventana
con la información, en settings > Notifications hay 3 opciones Ask (default), Allow, Block

La dejamos en Ask (default)

En app.js vamos al final del código y vamos a comprobar

1. Si el navegador soporta push notifications
2. Si el cliente ha otorgado permiso de recibir push notifications
3. Si no ha dado permiso le pedimos permiso al cliente

Si el navegador soporta push notifications podemos usar ES6


## Definir los servicios REST: PUSH, SUBSCRIBE, KEY

Vamos a trabajar en el back end para hacer la suscripción y poder enviar notificaciones push,
vamos a `routes.js` y vamos a crear varias rutas nuevas.


## Generar la llave pública y la privada

Para generar la llave pública y la privada necesitamos la librería `web-push`: `https://www.npmjs.com/package/web-push`

Esta librería nos va a permitir generar rápidamente lo que se conoce como VAPID keys, es un juego de llaves que
que necesitamos para poder enviar notificaciones push

> `npm install web-push --save`

Una cosa a tener en cuanta es que cada vez que generamos nuevas llaves, todas nuestras suscripciones dejan de funcionar
por lo que hay que tener mucho cuidado a la hora de generar nuevos VAPID keys

Vamos a crear un comando para mostrar los VAPID keys y otro para generarlos, vamos a package.json > scripts y añadimos

`"generate-vapid": "./node_modules/web-push/src/cli.js generate-vapid-keys"`

Esto es así porque no hemos instalado web-push de forma global, que se puede, lo hemos hecho de forma local

si estuviera de forma global el comando es > `web-push generate-vapid-keys`

Para nosotros el comando es > `npm run generate-vapid`

Esto genera un Public Key y un Private Key

Para que nos lo genere en formato json y lo guarde en un archivo `vapid.json` añadimos unos comandos al script:

`"generate-vapid": "./node_modules/web-push/src/cli.js generate-vapid-keys --json > server/vapid.json"`

Se crea el archivo `vapid.json` ahora vamos a leerlo desde la ruta key.

Para ello vamos a crear un módulo de js, un archivo `push.js` en el directorio server que lee el archivo json

Para usar este módulo en `routes.js` lo importamos con el método `require`

Probamos en Postman y recibimos la llave pública


## Retornar la llave pública de forma segura

En la documentación de web-push no recomiendan manejar la llave pública tal cual, sino codificarla
y para ello nos ofrecen una función que lo hace, el problema es que estamos en node y no tenemos acceso al objeto
windows por lo que la función tal cual no nos sirve.

Tenemos un módulo para node que lo hace `urlsafe-base64` en `https://www.npmjs.com/package/urlsafe-base64`

> `npm install urlsafe-base64 --save`

Después lo requerimos `require('urlsafe-base64')` en `push.js` y lo implementamos

Probamos en Postman

Ahora tomamos esta llave y la preparamos desde el frontend `app.js` para crear la suscripción

En la ruta key ya no lo enseñamos como un json sino como send, en la página web vemos por consola un Uint8Array
pero en Postman salen caracteres raros, esto es porque Postman no puede procesar el tipo de datos


## Generar la suscripción

Con la llave pública generada de esta manera ya podemos generar la suscripción que es manejada por el sw.

Antes hay que cambiar un poco como implementamos el registro de sw, es buena práctica registrarlo cuando el
navegador carga en su totalidad la app porque el sw hace instalaciones y recursos fetch que pueden retrasar
la carga de la vista, nos vamos para ello a `app.js` donde se registra el sw

Ahora creamos la suscripción al final de `app.js`

En consola vemos la información de la suscripción, con su endpoint hacia `fcm.googleapis.com` si estamos usando chrome
u otro navegador basado en chromium.
Con esta información y la llave privada que tiene el servidor somos capaces de enviar notificaciones push.


## Enviar la suscripción al servidor

Tenemos creada nuestra ruta para almacenar la suscripción, ahora tenemos que enviar a esa ruta los datos de la suscripción,
lo hacemos mediante POST en la parte donde generamos la suscripción.

Ahora en el backend en la ruta de subscribe recibimos el body con la suscripción y la almacenamos en un arreglo


## Guardar las suscripciones en el backend para que sean persistentes

El arreglo no es persistente si se reinicia el servidor se pierde, normalmente guardaríamos los datos en una DB
pero aquí lo vamos a almacenar en un archivo en `server/subs-db.json`

Requerimos el módulo de `node` `fs` (file system) que nos permite crear, leer, editar, guardar y borrar archivos

Al suscribirnos se crea el archivo con los datos en formato `json`, si ya existe se reescribe.

Hay un problema y es que al gestionar el archivo con `fs` el proceso de `nodemon` reinicia el servidor y el arreglo se pierde
para ello vamos a `package.json` y le decimos a nodemon que ignore los archivos con extensión `json`

En `scripts` > `dev` añadimos al final `--ignore server/*.json`

Ahora en vez de inicializar nuestro arreglo como vacío apuntamos a este archivo, el archivo debe existir y tener al menos un arreglo
vacío dentro, sigue siendo un documento `json` válido.


## Cancelar la suscripción

Normalmente se hace desde el front-end pero también se puede hacer desde el backend.

Vamos `app.js` al final del código y creamos la función para cancelar y la ejecutamos al presionar el botón `btnActivadas`
y si hay algún error al suscribirnos en el catch ejecutamos la función de cancelar suscripción también.


## Enviar Notificaciones Push

Primero debemos dejar subs-db.json con un arreglo vacío, cerramos y levantamos el servidor y creamos una única suscripción

Configuramos nuestro backend, para ello necesitamos el módulo `web-push` de `https://www.npmjs.com/package/web-push`

Ya lo tenemos instalado, vamos a `push.js` y requerimos `web-push` y lo manejamos según la documentación, creamos la
función `sendPushNotification`

Desde la ruta push recibimos los datos de la notificación y la enviamos ejecutando la función `sendPushNotification`

Ahora en sw.js tenemos que añadir un event listener que escuche eventos push

Regresamos a la app y limpiamos caché para que el sw se actualice y desde Postman enviamos una notificación con
titulo, cuerpo y usuario en el body

Recibimos en consola la notificación como `Pushevent`.

Ahora en push.js con webpush.sendNotification enviamos la notificación desde Postman, y nos llega la notificación, tenemos que
tener abierto el navegador desde donde hemos aceptado recibir notificaciones de la app, pero no hace falta que esté abierta la app.


## Opciones de una notificación

Documentación: `https://developers.google.com/web/fundamentals/push-notifications/display-a-notification`


Opciones de vibración del dispositivo: `https://gearside.com/custom-vibration-patterns-mobile-devices/`

En `sw.js` añadimos ruta para push donde incluimos las opciones de la notificación


## Redireccionar desde la notificación

Podemos abrir la app haciendo click en la notificación.

En `sw.js` añadimos event listener de click en la notificación


## Borrar suscripciones que ya no son válidas

En `push.js` en la función `sendPushNotification` añadimos el catch y creamos un arreglo con las suscripciones que dan error
y recorremos el arreglo para ir borrando de `subs-db.json`


# Recursos nativos del dispositivo

## Geolocalización

La geolocalización nos la da el navegador tanto en desktop como en móvil

Documentación de la API > `https://developers.google.com/web/fundamentals/native-hardware/user-location/?hl=es-419`

Vamos a `app.js` a la parte de Obtener la geolocalización

con el método `getCurrentPosition` obtenemos la geolocalización al instante

con el método `watchPosition` obtenemos la geolocalización varias veces, cuando se obtiene una posición más precisa o cuando
las posición ha cambiado


## Cámara

Vamos a poner la lógica de la cámara en archivo aparte `camara-class.js` va a ser una clase común

Importamos `camara-class.js` en `index.html` antes que app.js y lo añadimos al `APP_SHELL`

Ahora en `app.js` creamos una instancia de la clase camara

Documentación: `https://developer.mozilla.org/es/docs/Web/API/MediaDevices/getUserMedia`


## Share API

Share API es una forma nueva de Chrome Android para compartir objetos y mandarlo a notas, a Facebook, mandar por mensaje privado,
dependiendo de lo que se tenga instalado en el dispositivo.

Documentación: `https://web.dev/web-share/`

Funciona en Safari, Chrome Android y Firefox Android

Nos vamos al final del código de app.js y comprobamos si el navegador soporta share API

Ahora queremos que cuando se hace click sobre un mensaje compartamos el mensaje y el usuario que lo escribió



# GIT

En nuestra cuenta de github creamos un repositorio

Si no tenemos repositorio git local lo creamos > `git init`

Si no tenemos archivo `.gitignore` lo creamos, especialmente para evitar `node_modules`

Añadimos los cambios a GIT> `git add .`
Commit > `git commit -m "Primer commit"`

Si en este punto borro accidentalmente algo puedo recuperarlo con > `git checkout -- .`

Que nos recontruye los archivos tal y como estaban en el último commit.

Enlazamos el repositorio local con un repositorio externo en GitHub donde tenemos cuenta y hemos creado un repositorio
`git remote add origin https://github.com/Awandor/twitter-pwa-push-notifications-native-resources.git`

Situarnos en la rama master > `git branch -M master`

Subir todos los cambios a la rama master remota > `git push -u origin master`

Para reconstruir en local el código de GitHub nos bajamos el código y ejecutamos `npm install` que instala todas las dependencias


## Tags y Releases

Crear un tag en Github y un Release

> `git tag -a v1.0.0 -m "Versión 1 - Lista para producción"`

> `git tag` muestra los tags

> `git push --tags` > sube los tags al repositorio remoto

En github vamos a Tags > Add release notes
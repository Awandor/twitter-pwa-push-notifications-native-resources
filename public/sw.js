// imports
importScripts( 'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js' )

importScripts( 'js/sw-db.js' );
importScripts( 'js/sw-utils.js' );


const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';


const APP_SHELL = [
  '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js',
  'js/sw-utils.js',
  'js/libs/plugins/mdtoast.min.js',
  'js/libs/plugins/mdtoast.min.css',
  'js/camara-class.js'
];

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  'https://cdn.jsdelivr.net/npm/pouchdb@7.0.0/dist/pouchdb.min.js'
];


// ========================================
// Evento install
// ========================================

self.addEventListener( 'install', e => {


  const cacheStatic = caches.open( STATIC_CACHE ).then( cache =>
    cache.addAll( APP_SHELL ) );

  const cacheInmutable = caches.open( INMUTABLE_CACHE ).then( cache =>
    cache.addAll( APP_SHELL_INMUTABLE ) );



  e.waitUntil( Promise.all( [ cacheStatic, cacheInmutable ] ) );

} );


self.addEventListener( 'activate', e => {

  const respuesta = caches.keys().then( keys => {

    keys.forEach( key => {

      if ( key !== STATIC_CACHE && key.includes( 'static' ) ) {
        return caches.delete( key );
      }

      if ( key !== DYNAMIC_CACHE && key.includes( 'dynamic' ) ) {
        return caches.delete( key );
      }

    } );

  } );

  e.waitUntil( respuesta );

} );


// ========================================
// Evento fetch
// ========================================

self.addEventListener( 'fetch', e => {

  let respuesta;

  if ( e.request.url.includes( '/api' ) ) {

    // return respuesta????
    respuesta = manejoApiMensajes( DYNAMIC_CACHE, e.request );

  } else {

    respuesta = caches.match( e.request ).then( res => {

      if ( res ) {

        actualizaCacheStatico( STATIC_CACHE, e.request, APP_SHELL_INMUTABLE );

        return res;

      } else {

        return fetch( e.request ).then( newRes => {

          return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );

        } );

      }

    } );

  }

  e.respondWith( respuesta );

} );


// ========================================
// Evento push
// ========================================

self.addEventListener( 'push', e => {

  // console.log( e );

  // console.log( e.data.text() );

  const data = JSON.parse( e.data.text() );

  console.log( 'sw escucha push', data );

  const title = data.titulo;

  const options = {
    body: data.cuerpo,
    // icon: 'img/icons/icon-72x72.png',
    icon: `img/avatars/${data.usuario}.jpg`,
    badge: 'img/favicon.ico', // Solo para Android
    image: 'https://i.ytimg.com/vi/ikUyPE6EzvQ/hqdefault.jpg',
    vibrate: [ 500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500 ],
    data: {
      url: '/', // Poner dominio en producción
      id: data.usuario // podemos poner lo que queramos en data
    },
    actions: [ // No se usan mucho, se pueden poner las acciones que se quiera
      {
        action: 'thor-action',
        title: 'Thor',
        icon: 'img/avatars/thor.jpg'
      },
      {
        action: 'ironman-action',
        title: 'Ironman',
        icon: 'img/avatars/ironman.jpg'
      }
    ]
  };

  e.waitUntil( self.registration.showNotification( title, options ) );

} );


// ========================================
// Evento cerrar Notificación Push
// ========================================

self.addEventListener( 'notificationclose', e => {

  console.log( 'Notificación cerrada', e );

} );


// ========================================
// Evento click en Notificación Push
// ========================================

self.addEventListener( 'notificationclick', e => {

  console.log( 'Click en Notificación', e );

  if ( e.action === 'thor-action' ) {

    console.log( 'Se ha hecho click en la acción de Thor' );

  }

  // clients es una referencia a los tabs del navegador

  const respuesta = clients.matchAll().then( resp => {

    /* let cliente = resp.find( c => {

      return c.visibilityState === 'visible';

    } ); */

    let cliente = resp.find( resp => {

      return resp.url.includes( 'localhost' ); // Cambiar por dominio en producción

    } );

    if ( cliente !== undefined ) {

      cliente.navigate( e.notification.data.url );

      cliente.focus();

    } else {

      clients.openWindow( e.notification.data.url );

    }

    return e.notification.close(); // Cierra la notificación

  } );

  e.waitUntil( respuesta );

} );


// ========================================
// Tareas asíncronas
// ========================================


self.addEventListener( 'sync', e => {

  console.log( 'SW: Sync' );

  if ( e.tag === 'nuevo-post' ) {

    // postear a BD cuando hay conexión
    const respuesta = postearMensajes();

    e.waitUntil( respuesta );

  }

} );

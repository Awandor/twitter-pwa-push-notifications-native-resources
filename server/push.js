const vapid = require( './vapid.json' ); // Así de fácil se leen archivos json en node.js

const urlsafeBase64 = require( 'urlsafe-base64' );

// fs viene de node, es file system que permite el manejo de archivos
const fs = require( 'fs' );

// let suscripciones = [];
let suscripciones = require( './subs-db.json' );

const webpush = require( 'web-push' );
const { sep } = require( 'path' );

webpush.setVapidDetails(
  'mailto:dan@awandor.com', // no es obligatorio
  vapid.publicKey,
  vapid.privateKey
);


// ========================================
// Función obtener llave pública
// ========================================

module.exports.getKey = () => {

  // return vapid.publicKey;
  return urlsafeBase64.decode( vapid.publicKey );

};


// ========================================
// Función añadir suscripción
// ========================================

module.exports.addSubscription = ( suscripcion ) => {

  suscripciones.push( suscripcion );

  console.log( 'addSubscription', suscripciones );

  // Cada vez el archivo es reescrito, si no existe es creado

  fs.writeFileSync( `${__dirname}/subs-db.json`, JSON.stringify( suscripciones ) );

};


// ========================================
// Función send push notification !!!
// ========================================

module.exports.sendPushNotification = ( post ) => {

  // Se envian a todas las suscripciones que hay en el arreglo

  console.log( 'Entro en sendPushNotification', JSON.stringify( post ) );

  let notificacionesEnviadas = [];

  suscripciones.forEach( ( suscripcion, i ) => {

    // webpush.sendNotification( suscripcion, 'Hola mundo' );
    // webpush.sendNotification( suscripcion, post.titulo );
    const pushPromise = webpush.sendNotification( suscripcion, JSON.stringify( post ) ).then( console.log( 'Notificación enviada' ) ).catch( err => {

      console.log( 'Error al enviar notificación desde el backend', err );

      if ( err.statusCode === 410 ) {

        // Ya no existe la suscripción, hay que borrarla pero como estoy dentro del forEach es mejor marcarla para después borrar

        suscripciones[ i ].borrar = true;

      }

    } );

    notificacionesEnviadas.push( pushPromise );

  } );

  Promise.all( notificacionesEnviadas ).then( () => {

    suscripciones = suscripciones.filter( resp => {

      return !resp.borrar;

    } );

    fs.writeFileSync( `${__dirname}/subs-db.json`, JSON.stringify( suscripciones ) );

  } );

};

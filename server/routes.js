// Routes.js - Módulo de rutas
const express = require( 'express' );
const router = express.Router();
const push = require( './push' );

const mensajes = [

  {
    _id: 'XXX',
    user: 'spiderman',
    mensaje: 'Hola Mundo'
  }

];


// ========================================
// Ruta para recibir mensajes del chat
// ========================================

router.get( '/', function( req, res ) {
  // res.json('Obteniendo mensajes');
  res.json( mensajes );
} );


// ========================================
// Ruta para Post de mensaje
// ========================================

router.post( '/', function( req, res ) {

  // console.log( req.body.lat );
  // console.log( req.body.lng );

  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user,
    lat: req.body.lat,
    lng: req.body.lng
  };

  mensajes.push( mensaje );

  console.log( mensajes );

  // Enviar notificación push del mensaje

  const notificacion = {
    titulo: 'Nuevo mensaje de Twitter',
    cuerpo: req.body.mensaje,
    usuario: req.body.user
  };

  push.sendPushNotification( notificacion );

  res.json( {
    ok: true,
    mensaje
  } );
} );


// ========================================
// Ruta para las Notificaciones Push
// ========================================

// Ruta para almacenar la suscripción: POST

router.post( '/subscribe', ( req, resp ) => {

  // Almacenamos a suscripción normalmente en una base de datos, aquí lo vamos a hacer en un archivo de texto



  const suscripcion = req.body;

  console.log( 'Request subscribe body', suscripcion ); // Esto se ve en la consola de visual studio

  push.addSubscription( suscripcion ); // push es una constante que hace referencia al archivo push.js

  resp.json( 'subscribe' ); // Si el servidor no responde con algo da error en el fetch

} );


// ========================================
// Ruta para obtener la llave (key): GET
// ========================================

router.get( '/key', ( req, resp ) => {

  const publicKey = push.getKey();

  // resp.json( 'key público' );
  // resp.json( publicKey );

  // Ya no estamos recibiendo un json sino un Uint8Array
  resp.send( publicKey );

} );


// ========================================
// Ruta para Enviar notificación Push a las personas que queramos: POST
// ========================================

router.post( '/push', ( req, resp ) => {

  // Normalmente esto no se maneja como un servicio Rest pues es algo que se controla del lado del servidor
  // pero nos ayudará en este ejercicio a hacer notificaciones Push desde Postman

  // console.log( 'Entro en routes push', req );

  const notificacion = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario
  };

  push.sendPushNotification( notificacion );

  // resp.json( 'push' );
  resp.json( notificacion );

} );


module.exports = router;

const url = window.location.href;

let swLocation = '/twittor/sw.js'; // Poenr aquí la ruta del hosting

// Referencia al registro del sw
let swRegistro;


// ========================================
// Registro del sw
// ========================================

if ( navigator.serviceWorker ) {


  if ( url.includes( 'localhost' ) ) {
    swLocation = '/sw.js';
  }

  // navigator.serviceWorker.register( swLocation );

  window.addEventListener( 'load', function() {

    // Necesitamos manejar el registro porque 

    navigator.serviceWorker.register( swLocation ).then( function( resp ) {

      swRegistro = resp;

      // verificaSuscripcion sin paréntesis para que no se ejecute en ese punto, es una referencia
      // a la funcion, el que la ejecuta es addEventListener

      swRegistro.pushManager.getSubscription().then( verificaSuscripcion );

    } );

  } );

}


// ========================================
// Google Maps
// ========================================

// Referencias de jQuery
const googleMapKey = 'AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8';

// Google Maps llaves alternativas - desarrollo
// AIzaSyDyJPPlnIMOLp20Ef1LlTong8rYdTnaTXM
// AIzaSyDzbQ_553v-n8QNs2aafN9QaZbByTyM7gQ
// AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8
// AIzaSyCroCERuudf2z02rCrVa6DTkeeneQuq8TA
// AIzaSyBkDYSVRVtQ6P2mf2Xrq0VBjps8GEcWsLU
// AIzaSyAu2rb0mobiznVJnJd6bVb5Bn2WsuXP2QI
// AIzaSyAZ7zantyAHnuNFtheMlJY1VvkRBEjvw9Y
// AIzaSyDSPDpkFznGgzzBSsYvTq_sj0T0QCHRgwM
// AIzaSyD4YFaT5DvwhhhqMpDP2pBInoG8BTzA9JY
// AIzaSyAbPC1F9pWeD70Ny8PHcjguPffSLhT-YF8



// Referencias de jQuery

var titulo = $( '#titulo' );
var nuevoBtn = $( '#nuevo-btn' );
var salirBtn = $( '#salir-btn' );
var cancelarBtn = $( '#cancel-btn' );
var postBtn = $( '#post-btn' );
var avatarSel = $( '#seleccion' );
var timeline = $( '#timeline' );

var modal = $( '#modal' );
var modalAvatar = $( '#modal-avatar' );
var avatarBtns = $( '.seleccion-avatar' );
var txtMensaje = $( '#txtMensaje' );

var btnActivadas = $( '.btn-noti-activadas' );
var btnDesactivadas = $( '.btn-noti-desactivadas' );


var btnLocation = $( '#location-btn' );

var modalMapa = $( '.modal-mapa' );

var btnTomarFoto = $( '#tomar-foto-btn' );
var btnPhoto = $( '#photo-btn' );
var contenedorCamara = $( '.camara-contenedor' );

var lat = null;
var lng = null;
var foto = null;

// El usuario, contiene el ID del héroe seleccionado
var usuario;

// Init de la camara class
const camara = new Camara( document.getElementById( 'player' ) );




// ===== Codigo de la aplicación

function crearMensajeHTML( mensaje, personaje, lat, lng, foto ) {

  // console.log(mensaje, personaje, lat, lng);

  var content = `
  <li class="animated fadeIn fast"
      data-tipo="mensaje"
      data-user="${ personaje }"
      data-mensaje="${ mensaje }">

      <div class="avatar">
          <img src="img/avatars/${ personaje }.jpg">
      </div>
      <div class="bubble-container">
          <div class="bubble">
              <h3>@${ personaje }</h3>
              <br/>
              ${ mensaje }
              `;

  if ( foto ) {
    content += `
              <br>
              <img class="foto-mensaje" src="${ foto }">
      `;
  }

  content += `</div>        
              <div class="arrow"></div>
          </div>
      </li>
  `;


  // si existe la latitud y longitud, 
  // llamamos la funcion para crear el mapa
  if ( lat ) {
    crearMensajeMapa( lat, lng, personaje );
  }

  // Borramos la latitud y longitud por si las usó
  lat = null;
  lng = null;

  $( '.modal-mapa' ).remove();

  timeline.prepend( content );
  cancelarBtn.click();

}

function crearMensajeMapa( lat, lng, personaje ) {


  let content = `
  <li class="animated fadeIn fast"
      data-tipo="mapa"
      data-user="${ personaje }"
      data-lat="${ lat }"
      data-lng="${ lng }">
              <div class="avatar">
                  <img src="img/avatars/${ personaje }.jpg">
              </div>
              <div class="bubble-container">
                  <div class="bubble">
                      <iframe
                          width="100%"
                          height="250"
                          frameborder="0" style="border:0"
                          src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
                          </iframe>
                  </div>
                  
                  <div class="arrow"></div>
              </div>
          </li> 
  `;

  timeline.prepend( content );
}



// Globals
function logIn( ingreso ) {

  if ( ingreso ) {
    nuevoBtn.removeClass( 'oculto' );
    salirBtn.removeClass( 'oculto' );
    timeline.removeClass( 'oculto' );
    avatarSel.addClass( 'oculto' );
    modalAvatar.attr( 'src', 'img/avatars/' + usuario + '.jpg' );
  } else {
    nuevoBtn.addClass( 'oculto' );
    salirBtn.addClass( 'oculto' );
    timeline.addClass( 'oculto' );
    avatarSel.removeClass( 'oculto' );

    titulo.text( 'Seleccione Personaje' );

  }

}


// Seleccion de personaje
avatarBtns.on( 'click', function() {

  usuario = $( this ).data( 'user' );

  titulo.text( '@' + usuario );

  logIn( true );

} );

// Boton de salir
salirBtn.on( 'click', function() {

  logIn( false );

} );

// Boton de nuevo mensaje
nuevoBtn.on( 'click', function() {

  modal.removeClass( 'oculto' );
  modal.animate( {
    marginTop: '-=1000px',
    opacity: 1
  }, 200 );

} );


// Boton de cancelar mensaje
cancelarBtn.on( 'click', function() {
  if ( !modal.hasClass( 'oculto' ) ) {
    modal.animate( {
      marginTop: '+=1000px',
      opacity: 0
    }, 200, function() {
      modal.addClass( 'oculto' );
      txtMensaje.val( '' );
    } );
  }
} );

// Boton de enviar mensaje
postBtn.on( 'click', function() {

  var mensaje = txtMensaje.val();
  if ( mensaje.length === 0 ) {
    cancelarBtn.click();
    return;
  }

  var data = {
    mensaje: mensaje,
    user: usuario,
    lat: lat,
    lng: lng,
    foto: foto
  };


  fetch( 'api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( data )
    } )
    .then( res => res.json() )
    .then( res => console.log( 'app.js', res ) )
    .catch( err => console.log( 'app.js error:', err ) );

  // contenedorCamara.apagar();

  // contenedorCamara.addClass( 'oculto' );


  crearMensajeHTML( mensaje, usuario, lat, lng, foto );

  foto = null;

} );



// Obtener mensajes del servidor
function getMensajes() {

  fetch( 'api' )
    .then( res => res.json() )
    .then( posts => {

      console.log( posts );
      posts.forEach( post =>
        crearMensajeHTML( post.mensaje, post.user ) );

    } );

}

getMensajes();



// Detectar cambios de conexión
function isOnline() {

  if ( navigator.onLine ) {
    // tenemos conexión
    // console.log('online');
    $.mdtoast( 'Online', {
      interaction: true,
      interactionTimeout: 1000,
      actionText: 'OK!'
    } );


  } else {
    // No tenemos conexión
    $.mdtoast( 'Offline', {
      interaction: true,
      actionText: 'OK',
      type: 'warning'
    } );
  }

}

window.addEventListener( 'online', isOnline );
window.addEventListener( 'offline', isOnline );

isOnline();


// ========================================
// Notificaciones Push
// ========================================

function verificaSuscripcion( activa ) {

  console.log( 'verificaSuscripcion', activa );

  if ( activa ) {

    btnActivadas.removeClass( 'oculto' );
    btnDesactivadas.addClass( 'oculto' );

  } else {

    btnActivadas.addClass( 'oculto' );
    btnDesactivadas.removeClass( 'oculto' );

  }
}

// verificaSuscripcion( false );

function enviarNotificacionPush() {

  const notificationOpts = {
    body: 'Este es el cuerpo de la notificación',
    icon: 'img/icons/icon-72x72.png'
  };

  const n = new Notification( 'Hola mundo', notificationOpts );

  n.onclick = () => {

    console.log( 'Click' );

  };

}

function notificacionesPush() {

  // Verificar si el navegador soporta notificaciones push

  if ( !window.Notification ) {

    console.log( 'Este navegador no soporta notificaciones' );

    return;

  }

  if ( Notification.permission === 'granted' ) {

    // new Notification( 'Hola mundo' );

    enviarNotificacionPush();

  } else if ( Notification.permission !== 'denied' || Notification.permission === 'default' ) {

    Notification.requestPermission( ( permission ) => {

      console.log( 'El permiso es: ', permission );

      if ( permission === 'granted' ) {

        // new Notification( 'Hola mundo desde la pregunta' );

        enviarNotificacionPush();

      }

    } );

  }
}

// notificacionesPush();


function getPublicKey() {

  // A modo de prueba

  /* fetch( 'api/key' ).then( resp => {

    return resp.text();

  } ).then( console.log ); */

  // Para la suscripción lo necesitamos en otro formato y que retorne una promesa

  return fetch( 'api/key' ).then( resp => {

    return resp.arrayBuffer(); // arrayBuffer es un método de js

  } ).then( resp => {

    return new Uint8Array( resp ); // Uint8Array es un método de js

  } );

}

// getPublicKey().then( console.log );


// ========================================
// Generar la suscripción a Notificaciones Push
// ========================================

btnDesactivadas.on( 'click', () => {

  if ( !swRegistro ) {

    return console.log( 'No hay ningún sw registrado' );

  }

  getPublicKey().then( key => {

    swRegistro.pushManager.subscribe( {
      userVisibleOnly: true,
      applicationServerKey: key
    } ).then( resp => {

      return resp.toJSON();

    } ).then( suscripcion => {

      console.log( 'subscribe', suscripcion );

      // Posteo de la suscripción

      fetch( 'api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( suscripcion )
      } ).then( RespSub => {

        console.log( 'Respuesta de la suscripción', RespSub );

        verificaSuscripcion( true );

      } ).catch( err => {

        console.log( 'Error en la suscripción', err );

        cancelarSuscripcion();

      } );

      // verificaSuscripcion( suscripcion );

    } );

  } );

} );


// ========================================
// Cancelar suscripción
// ========================================

function cancelarSuscripcion() {

  swRegistro.pushManager.getSubscription().then( resp => {

    resp.unsubscribe().then( () => {

      verificaSuscripcion( false );

    } );

  } );
}

btnActivadas.on( 'click', () => {

  cancelarSuscripcion();

} );


// ========================================
// Crear mapa en el modal
// ========================================

function mostrarMapaModal( lat, lng ) {

  $( '.modal-mapa' ).remove();

  var content = `
          <div class="modal-mapa">
              <iframe
                  width="100%"
                  height="250"
                  frameborder="0"
                  src="https://www.google.com/maps/embed/v1/view?key=${ googleMapKey }&center=${ lat },${ lng }&zoom=17" allowfullscreen>
                  </iframe>
          </div>
  `;

  modal.append( content );
}


// Sección 11 - Recursos Nativos


// ========================================
// Obtener la geolocalización
// ========================================

btnLocation.on( 'click', () => {

  // console.log( 'Botón geolocalización' );

  // check for Geolocation support
  if ( navigator.geolocation ) {

    // console.log( 'Geolocation is supported!' );

    $.mdtoast( 'Obteniendo localización', {
      interaction: true,
      interactionTimeout: 2000,
      actionText: 'OK'
    } );

    navigator.geolocation.getCurrentPosition( pos => {

      console.log( pos );

      lat = pos.coords.latitude;

      lng = pos.coords.longitude;

      mostrarMapaModal( lat, lng );

    } );

  } else {

    console.log( 'Geolocation is not supported for this Browser/OS.' );

    $.mdtoast( 'Geolocation is not supported for this Browser/OS.', {
      interaction: true,
      interactionTimeout: 2000,
      actionText: 'OK'
    } );

  }




} );



// Boton de la camara
// usamos la funcion de flecha para prevenir
// que jQuery cambie el valor del this
btnPhoto.on( 'click', () => {

  console.log( 'Inicializar camara' );

  contenedorCamara.removeClass( 'oculto' );

  // camara es una instancia de la clase Camara

  camara.encenderCamara();

} );


// Boton para tomar la foto
btnTomarFoto.on( 'click', () => {

  console.log( 'Botón tomar foto' );

  foto = camara.obtenerFoto();

  // console.log( foto );

  camara.apagarCamara();

  // Para convertir base64 en imagen, esto tiene que hacerse en node

  /* // Remove header
  let fotoImg = foto.split( ';base64,' ).pop();

  fs.writeFile( 'image.png', fotoImg, { encoding: 'base64' }, function( err ) {

    console.log( 'File created' );

  } ); */

} );


// ========================================
// Share API
// ========================================

if ( navigator.share ) {

  console.log( 'El navegador soporta share API' );

} else {

  console.log( 'El navegador no soporta share API' );

}

// jQuery

timeline.on( 'click', 'li', function() {

  // Si usamos función flecha this no apunta bien, heredamos el this antes del click

  const tipo = $( this ).data( 'tipo' );
  const lat = $( this ).data( 'lat' );
  const lng = $( this ).data( 'lng' );
  const mensaje = $( this ).data( 'mensaje' );
  const user = $( this ).data( 'user' );

  console.log( `click en elemento li: ${tipo}, ${lat}, ${lng}, ${mensaje}, ${user}` );

  console.log( { tipo, lat, lng, mensaje, user } );

  const shareOpts = {
    title: user,
    text: mensaje
  };

  if ( tipo === 'mapa' ) {
    shareOpts.text = 'Mapa',
      shareOpts.url = `https://www.google.com/maps/@${lat},${lng},15z`
  }

  /* navigator.share( {
      title: user,
      text: mensaje,
      url: 'https://web.dev/',
    } )
    .then( () => console.log( 'Successful share' ) )
    .catch( ( error ) => console.log( 'Error sharing', error ) ); */

  navigator.share( shareOpts )
    .then( () => console.log( 'Successful share' ) )
    .catch( ( error ) => console.log( 'Error sharing', error ) );

} );

// Vanilla

/* document.getElementById( 'timeline' ).addEventListener( 'click', function( event ) {

  console.log( event );

  // If the clicked element doesn't have the right selector, bail
  if ( !event.target.matches( 'li' ) ) {

    return;

  }

  // Don't follow the link
  event.preventDefault();

  // Log the clicked element in the console
  console.log( event.target );

}, false );
 */

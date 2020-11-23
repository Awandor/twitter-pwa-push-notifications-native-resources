class Camara {

  constructor( videoNode ) {

    // En las clases de ES6 podemos definir variables con this en cualquier lugar del cuerpo de la clase

    this.videoNode = videoNode;

  }

  encenderCamara() {

    // Validar si el dispositivo tiene cámara

    if ( navigator.mediaDevices ) {

      // console.log( 'Geolocation is supported!' );

      $.mdtoast( 'Encendiendo cámara', {
        interaction: true,
        interactionTimeout: 2000,
        actionText: 'OK'
      } );

      // Si no configuramos el video va a activarse con la máxima resolución

      navigator.mediaDevices.getUserMedia( {
        audio: false,
        video: {
          width: 300,
          height: 300
        }
      } ).then( resp => {

        this.videoNode.srcObject = resp;

        this.stream = resp;

      } );

    } else {

      console.log( 'No se puede detectar cámara' );

      $.mdtoast( 'No se puede detectar cámara', {
        interaction: true,
        interactionTimeout: 2000,
        actionText: 'OK'
      } );

    }

  }

  apagarCamara() {

    this.videoNode.pause(); // Congela la imágen

    // Pero sigue haciendo streaming de imágenes

    if ( this.stream ) {

      this.stream.getTracks()[ 0 ].stop(); // detiene el streaming

    }

  }

  obtenerFoto() {

    let canvas = document.createElement( 'canvas' );

    // Dimensiones del canvas igual al elemento del video

    canvas.setAttribute( 'width', 300 );
    canvas.setAttribute( 'height', 300 );

    // Obtener el contexto del canvas

    let context = canvas.getContext( '2d' ); // una imagen

    context.drawImage( this.videoNode, 0, 0, canvas.width, canvas.height );

    this.foto = context.canvas.toDataURL();

    // limpieza

    canvas = null;
    context = null;

    return this.foto;

  }

}

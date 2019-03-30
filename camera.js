function initPointerLock() {
  // Start by going fullscreen with the element.  Current implementations
  // require the element to be in fullscreen before requesting pointer
  // lock--something that will likely change in the future.
  canvas.requestFullscreen = canvas.requestFullscreen    ||
                             canvas.mozRequestFullscreen ||
                             canvas.mozRequestFullScreen || // Older API upper case 'S'.
                             canvas.webkitRequestFullscreen;
  canvas.addEventListener('click', canvas.requestFullscreen, false);

  document.addEventListener('fullscreenchange', fullscreenChange, false);
  document.addEventListener('mozfullscreenchange', fullscreenChange, false);
  document.addEventListener('webkitfullscreenchange', fullscreenChange, false);

  document.addEventListener('pointerlockchange', pointerLockChange, false);
  document.addEventListener('mozpointerlockchange', pointerLockChange, false);
  document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
}

function fullscreenChange() {
  if ( document.webkitFullscreenElement === canvas ||
       document.mozFullscreenElement === canvas ||
       document.mozFullScreenElement === canvas ) { // Older API upper case 'S'.
    // Element is fullscreen, now we can request pointer lock
    canvas.requestPointerLock = canvas.requestPointerLock    ||
                                canvas.mozRequestPointerLock ||
                                canvas.webkitRequestPointerLock;
    canvas.requestPointerLock();
    gl.viewportWidth = canvas.width = window.innerWidth;
    gl.viewportHeight = canvas.height = window.innerHeight;
  }
  else{
    gl.viewportWidth = canvas.width = 500;
    gl.viewportHeight = canvas.height = 500;
  }
}

function pointerLockChange( e ){
  if ( document.pointerLockElement === canvas ||
       document.mozPointerLockElement === canvas ||
       document.webkitPointerLockElement === canvas )
  {
    document.addEventListener("mousemove", moveCallback, false);
  }
  else{
    document.removeEventListener("mousemove", moveCallback, false);
  }
}

function moveCallback( e ){
  if( !app.camera.disable ){
    var movementX = e.movementX       ||
                    e.mozMovementX    ||
                    e.webkitMovementX ||
                    0,
        movementY = e.movementY       ||
                    e.mozMovementY    ||
                    e.webkitMovementY ||
                    0;

  app.camera.heading += movementX / app.camera.sensitivity;
  app.camera.pitch += movementY / app.camera.sensitivity;
  // app.camera.roll += movementZ / app.camera.sen
    if( app.camera.pitch < -90 )
      app.camera.pitch = -90;
    if( app.camera.pitch > 90 )
      app.camera.pitch = 90;
    if( app.camera.heading < -180 )
      app.camera.heading += 360
    // if( app.camera.heading > 180 )
    //   app.camera.heading -= 360
  }
}

function cameraKeyDownHandler( e ){
  app.keys.pressed[ e.which ] = true;
  if( e.which === 16 ){
    app.camera.speed = app.camera.runSpeed;
  }
  // f
  if( e.which === 67 ){
    app.cameramode = (app.cameramode+1)%3;
    if(cameramode == 0)
    {
      app.camera.position[ X ] = 0.5 + (fish[fishselect].x - fish[fishselect].x/4)/4;
      app.camera.position[ Y ] = 0.5 + fish[fishselect].y/4;
      app.camera.position[ Z ] = 0.5 + (fish[fishselect].z - fish[fishselect].z/4)/4;
    }
  }

  if( e.which === 88 ){
    fishselect = (fishselect + 1)%nfish
  }

  if( e.which === 90 ){
    fishselect = (fishselect - 1 + nfish)%nfish
  }

  if( e.which === 72 ){
    eggs.push({x: 4*fish[fishselect].x, y: 4*fish[fishselect].y, z: 4*fish[fishselect].z, vx: 4*fish[fishselect].x/((4*fish[fishselect].y-0.2)/0.05), vy: 0.05, vz: 4*fish[fishselect].z/((4*fish[fishselect].y-0.2)/0.05),type: fish[fishselect].type});
    var audio = new Audio('sounds/drop.mp3');
    audio.play();
    console.log(fishselect);
  }

  if( e.which === 75 ){
    if (fishselect > -1) {
      fish.splice(fishselect, 1);
    }
  }

}

function cameraKeyUpHandler( e ){
  app.keys.pressed[ e.which ] = false;
  if( e.which == 16 ){
    app.camera.speed = app.camera.walkSpeed;
  }
}

function cameraShake(){
  app.camera.shakeTimer = app.camera.shakeTimer > Math.PI * 2 ? 0 : app.camera.shakeTimer + 0.01;
  app.camera.heading += app.camera.shakeAmplitude * Math.sin( app.camera.shakeTimer * app.camera.shakeFrequency );
  app.camera.pitch += app.camera.shakeAmplitude * Math.sin( app.camera.shakeTimer * app.camera.shakeFrequency );
}

function cameraMove() {
  var distance = app.elapsed * app.camera.speed;
  var camX = 0, camY = 0, camZ = 0;
  if(app.cameramode == 0)
  {
    var pitchFactor = 1;//Math.cos( degToRad( app.camera.pitch ) );
    // forward
    if( app.keys.pressed[ app.keys.W ] ){
      camX += distance * Math.sin( degToRad( app.camera.heading ) ) * pitchFactor;
      camY += distance * Math.sin( degToRad( app.camera.pitch ) ) * pitchFactor * -1.0
      camZ += distance * Math.cos( degToRad( app.camera.heading ) ) * pitchFactor * -1.0;
    }
    // backward
    if( app.keys.pressed[ app.keys.S ] ){
      camX += distance * Math.sin( degToRad( app.camera.heading ) ) * pitchFactor * -1.0;
      camZ += distance * Math.cos( degToRad( app.camera.heading ) ) * pitchFactor;
      camY += distance * Math.sin( degToRad( app.camera.pitch ) ) * pitchFactor
    }
    // strafing right
    if( app.keys.pressed[ app.keys.D ] ){
      camX += distance * Math.cos( degToRad( app.camera.heading ) );
      camZ += distance * Math.sin( degToRad( app.camera.heading ) );
    }
    // strafing left
    if( app.keys.pressed[ app.keys.A ] ){
      camX += -distance * Math.cos( degToRad( app.camera.heading ) );
      camZ += -distance * Math.sin( degToRad( app.camera.heading ) );
    }

    if( camX > distance )
      camX = distance;
    if( camX < -distance )
      camX = -distance;
    if( camZ > distance )
      camZ = distance;
    if( camZ < -distance )
      camZ = -distance;

    app.camera.position[ X ] += camX;
    app.camera.position[ Y ] += camY;
    app.camera.position[ Z ] += camZ;
  }
  else if(app.cameramode == 1)
  {
    // console.log(fishselect);
    app.camera.position[ X ] = 0.5 + (fish[fishselect].x - fish[fishselect].x/4)/4;
    app.camera.position[ Y ] = 0.5 + fish[fishselect].y/4;
    app.camera.position[ Z ] = 0.5 + (fish[fishselect].z - fish[fishselect].z/4)/4;
  }
  else if(app.cameramode == 2)
  {
    app.camera.position[ X ] = 15
    app.camera.position[ Y ] = 2;
    app.camera.position[ Z ] = 0;
  }

}

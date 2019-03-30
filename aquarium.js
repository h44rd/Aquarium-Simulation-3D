app.monkeyPositionTimer = 0;

function floatMonkey(){
  app.monkeyPositionTimer = app.monkeyPositionTimer > Math.PI * 2 ? 0 : app.monkeyPositionTimer + 0.05;
  app.monkey.position[Y] = Math.sin( app.monkeyPositionTimer )/5+1.3;
  app.monkey.position[X] = Math.cos(app.monkeyPositionTimer)/5;
}
app.aquariumCollision = 6;
function roomCollisionCheck(){
  if( app.camera.position[X] > app.aquariumCollision ){
    app.camera.position[X] = app.aquariumCollision
  }
  if( app.camera.position[X] < -app.aquariumCollision ){
    app.camera.position[X] = -app.aquariumCollision
  }
  if( app.camera.position[Z] > app.aquariumCollision ){
    app.camera.position[Z] = app.aquariumCollision
  }
  if( app.camera.position[Z] < -app.aquariumCollision ){
    app.camera.position[Z] = -app.aquariumCollision
  }
}

// function createParticles( num, min, max, maxVector, maxTTL, particles ){
//   var rangeX = max[X] - min[X];
//   var halfRangeX = rangeX/2;
//   var rangeY = max[Y] - min[Y];
//   var halfRangeY = rangeY/2;
//   var rangeZ = max[Z] - min[Z];
//   var halfRangeZ = rangeZ/2;
//
//   var halfMaxVector = maxVector / 2;
//
//   // holds single dimension array of x,y,z coords
//   particles.locations = [];
//   // holds single dimension array of vector direction using x,y,z coords
//   particles.vectors = [];
//   // holds a single float for the particle's time to live
//   particles.ttl = [];
//   for(i=0;i<num;i+=1){
//     // push x
//     particles.locations.push( (Math.random() *  rangeX) - halfRangeX );
//     // push y
//     particles.locations.push( (Math.random() *  rangeY) - halfRangeY );
//     // push z
//     particles.locations.push( (Math.random() *  rangeZ) - halfRangeZ );
//     // vectors
//     particles.vectors.push( (Math.random() *  maxVector) - halfMaxVector );
//     particles.vectors.push( (Math.random() *  maxVector) - halfMaxVector );
//     particles.vectors.push( (Math.random() *  maxVector) - halfMaxVector + 3);
//     // TTL
//     particles.ttl.push( Math.random() * maxTTL );
//   }
//
//   particles.locationsBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, particles.locationsBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( particles.locations ), gl.STATIC_DRAW);
//   particles.locationsBuffer.itemSize = 3;
//   particles.locationsBuffer.numItems = particles.locations.length / 3;
//
//   particles.vectorsBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, particles.vectorsBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( particles.vectors ), gl.STATIC_DRAW);
//   particles.vectorsBuffer.itemSize = 3;
//   particles.vectorsBuffer.numItems = particles.vectors.length / 3;
//
//   particles.ttlBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, particles.ttlBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( particles.ttl ), gl.STATIC_DRAW);
//   particles.ttlBuffer.itemSize = 1;
//   particles.ttlBuffer.numItems = particles.ttl.length;
//
// }

function drawaquarium(){
  var viewMatrix = mat4.create();
  mat4.identity(viewMatrix);
  var modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  floatMonkey();
  roomCollisionCheck();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0, app.pMatrix);

  vec3.negate( app.camera.position, app.camera.inversePosition )

  mat4.identity( app.mvMatrix )
  // camera position and rotations
  mat4.rotate( viewMatrix, degToRad( app.camera.pitch ), [1,0,0] );
  // account for pitch rotation and light down vector
  mat4.rotate( viewMatrix, degToRad( app.camera.heading ), [0,1,0] );
  mat4.translate( viewMatrix, app.camera.inversePosition );

  gl.useProgram( shaderProgram );

  var normalMatrix = mat3.create();
  mat4.toInverseMat3(viewMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  mat3.multiplyVec3( normalMatrix, app.lightVectorStatic, app.lightVector )
  mat4.multiplyVec3( viewMatrix, app.lightLocationStatic, app.lightLocation )
  gl.uniform3fv( shaderProgram.lightLocation, [0,2,2] );
  gl.uniform3fv( shaderProgram.lightVector, app.lightVector );

  setUniforms();
  mvPushMatrix();
    mvPushMatrix();
    mat4.scale( modelMatrix, [2,2,2] )
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    drawObject( app.models.room_floor, 0 );
    if(app.cameramode != 2)
    {
      drawObject( app.models.room_walls, 0 );
      drawObject( app.models.room_ceiling, 0 );
    }
    mvPopMatrix();

    mvPushMatrix();
    mat4.scale( modelMatrix, [0.01,0.01,0.01] );
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    drawObject( app.models.seaweed, 0, [0,1,0]);
    mat4.scale( modelMatrix, [100,100,100] );
    mvPopMatrix();

    mvPushMatrix();
    mat4.scale( modelMatrix, [0.01,0.01,0.01] );
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    mat4.translate( modelMatrix, [4,0,4] );
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    drawObject( app.models.seaweed, 0, [0,1,0]);
    mat4.scale( modelMatrix, [100,100,100] );
    mvPopMatrix();

    mvPushMatrix();
    mat4.scale( modelMatrix, [0.01,0.01,0.01] );
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    mat4.translate( modelMatrix, [2,0,4] );
    mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
    drawObject( app.models.seaweed, 0, [0,1,0]);
    mat4.scale( modelMatrix, [100,100,100] );
    mvPopMatrix();

      for (let i of fish) {
        if(i.type != -1)
        {
          mvPushMatrix();
          mat4.identity(modelMatrix);
          mat4.scale( modelMatrix, [2,2,2] )
          // mat4.translate( app.mvMatrix, -app.camera.inversePosition );
          // console.log(app.)
          // console.log([i.x, i.y, i.z]);
          // mat4.rotate( app.mvMatrix, degToRad( i.phi ), [1,0,0] );
          i.y += i.v*Math.sin(degToRad(i.phi))
          i.x += i.v*Math.cos(degToRad(i.phi))*Math.cos(degToRad(i.theta))
          i.z += i.v*Math.cos(degToRad(i.phi))*Math.sin(degToRad(i.theta))
          if(i.phi > 30){
            i.phi = 30
          }
          if(i.phi < -30){
            i.phi = -30
          }
          var dirchangespeed = 1
          if(Math.abs(i.x) >= 8 || Math.abs(i.z) >= 8)
          {
            i.theta -= dirchangespeed
          }

          if(i.y >= 5)
          {
            i.phi -= dirchangespeed/2
          }
          if(i.y < 3.5)
          {
            i.phi += dirchangespeed/2
          }
          if(i.size < 0.1)
          {
            i.size += 0.00002
          }
          // if(fish.indexOf(i) == 1)
          // {
          //   console.log(i);
          // }
          gl.uniform3fv( shaderProgram.lightSpecularColor, lightIntesity( 0.05, 0.0, 0.0, 0.01 ) );
          if(i.type == 0)
          {
            mat4.scale(modelMatrix,[i.size,i.size,i.size]);
            mat4.translate( modelMatrix, [i.x, i.y, i.z] );
            mat4.rotate( modelMatrix, degToRad( 90-i.theta ), [0,1,0] );
            mat4.rotate( modelMatrix, degToRad( -i.phi ), [1,0,0] );
            app.mvMatrix = mat4.identity();
            mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
            drawObject( app.models.fish1, 100, [0.0,0.0,0.0,0.0] );
          }
          else if(i.type == 1)
          {
            mat4.scale(modelMatrix,[codfish_coeff*i.size,codfish_coeff*i.size,codfish_coeff*i.size]);
            mat4.translate( modelMatrix, [i.x, i.y, i.z] );
            mat4.rotate( modelMatrix, degToRad( 90-i.theta ), [0,1,0] );
            mat4.rotate( modelMatrix, degToRad( -i.phi ), [1,0,0] );
            app.mvMatrix = mat4.identity();
            mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
            drawObject( app.models.fish2, 100, [0.0,0.0,0.0,0.0] );
          }
          else if(i.type == 2)
          {
            mat4.scale(modelMatrix,[goldfish_coeff*i.size,goldfish_coeff*i.size,goldfish_coeff*i.size]);
            mat4.translate( modelMatrix, [i.x, i.y, i.z] );
            mat4.rotate( modelMatrix, degToRad( 90-i.theta ), [0,1,0] );
            mat4.rotate( modelMatrix, degToRad( -i.phi ), [1,0,0] );
            app.mvMatrix = mat4.identity();
            mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
            drawObject( app.models.fish3, 100, [0.0,0.0,0.0,0.0] );
          }
          else if(i.type == 3)
          {
            mat4.scale(modelMatrix,[orca_coeff*i.size,orca_coeff*i.size,orca_coeff*i.size]);
            mat4.translate( modelMatrix, [i.x, i.y, i.z] );
            mat4.rotate( modelMatrix, degToRad( 90-i.theta ), [0,1,0] );
            mat4.rotate( modelMatrix, degToRad( -i.phi ), [1,0,0] );
            app.mvMatrix = mat4.identity();
            mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
            drawObject( app.models.fish4, 100, [0.0,0.0,0.0,0.0] );
          }
          else if(i.type == 4)
          {
            mat4.scale(modelMatrix,[dolphin_coeff*i.size,dolphin_coeff*i.size,dolphin_coeff*i.size]);
            mat4.translate( modelMatrix, [i.x, i.y, i.z] );
            mat4.rotate( modelMatrix, degToRad( 90-i.theta ), [0,1,0] );
            mat4.rotate( modelMatrix, degToRad( -i.phi ), [1,0,0] );
            app.mvMatrix = mat4.identity();
            mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)
            drawObject( app.models.fish5, 100, [0.0,0.0,0.0,0.0] );
          }
          mvPopMatrix();
        }
      }
      for (let i of eggs) {
        mvPushMatrix();
        mat4.identity(modelMatrix);
        mat4.scale( modelMatrix, [2,2,2] )
        mat4.scale(modelMatrix,[0.02,0.02,0.02]);
        mat4.translate( modelMatrix, [i.x, i.y, i.z] );
        console.log([i.x, i.y, i.z]);
        app.mvMatrix = mat4.identity();
        mat4.multiply(viewMatrix, modelMatrix, app.mvMatrix)

        if(i.y > 0.2){
          i.x -= i.vx
          i.y -= i.vy
          i.z -= i.vz
        }
        else
        {
          index = eggs.indexOf(i);
          console.log('egg reached!');
          // console.log(fish.length);
          fish.push({x : i.x, y: 2, z: i.z, v:0.05, size:0.025, type:i.type, theta:180, phi:10});
          // fish.push({x : 1, y: 1, z:1, v:0.05, size:0.025, type:0, theta:30, phi:10});
          console.log(i);
          if (index > -1) {
            eggs.splice(index, 1);
          }
        }
        gl.uniform3fv( shaderProgram.lightSpecularColor, lightIntesity( 0.05, 0.0, 0.0, 0.01 ) );
        // console.log(i.y);
        drawObject( app.models.egg, 100, [1.0,1.0,1.0,1.0] );
        mvPopMatrix();

      }


      mvPushMatrix();
        mat4.translate( app.mvMatrix, [0,2,0] );
        gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( 2.0, 1,1,1 ) );
        drawObject( app.models.skylight, 0, [0.53,0.81,0.98,1.0] );
        gl.uniform3fv( shaderProgram.ambientColorUniform, lightIntesity( app.ambientIntensity, 0.3,0.3,0.3 ) );
      mvPopMatrix();

    // drawObject( app.models.room_tunnel_ceiling, 0 );
    // drawObject( app.models.room_tunnel_walls, 0 );
  mvPopMatrix();

  // use the particle shaders
  if( app.animate ){
    app.animations.currentAnimation();
  }
}

app.drawScene = drawaquarium;

/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.slice');

// requires
goog.require('X.base');
goog.require('X.object');
goog.require('goog.math.Vec3');


/**
 * Create a displayable 2D slice/plane.
 * 
 * @constructor
 * @param {!Array} center The center position in 3D space as a 1-D Array with
 *          length 3.
 * @param {!Array} front A vector pointing in the direction of the front side in
 *          3D space as a 1-D Array with length 3.
 * @param {!Array} up A vector pointing in the up direction in 3D space as a 1-D
 *          Array with length 3.
 * @param {!number} width The width of the slice.
 * @param {!number} height The height of the slice.
 * @extends X.object
 */
X.slice = function(center, front, up, width, height) {

  if (!goog.isDefAndNotNull(center) || !(center instanceof Array) ||
      (center.length != 3)) {
    
    throw new Error('Invalid center.');
    
  }
  
  if (!goog.isDefAndNotNull(front) || !(front instanceof Array) ||
      (front.length != 3)) {
    
    throw new Error('Invalid front direction.');
    
  }
  
  if (!goog.isDefAndNotNull(up) || !(up instanceof Array) || (up.length != 3)) {
    
    throw new Error('Invalid up direction.');
    
  }
  
  if (!goog.isNumber(width)) {
    
    throw new Error('Invalid width.');
    
  }
  
  if (!goog.isNumber(height)) {
    
    throw new Error('Invalid height.');
    
  }
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this['_className'] = 'slice';
  
  /**
   * The center of this slice as a 3d vector.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = center;
  
  /**
   * The front of this slice as a 3d vector.
   * 
   * @type {!Array}
   * @protected
   */
  this._front = front;
  
  /**
   * The up direction of this slice as a 3d vector.
   * 
   * @type {!Array}
   * @protected
   */
  this._up = up;
  
  /**
   * The width of this slice.
   * 
   * @type {number}
   * @protected
   */
  this._width = width;
  
  /**
   * The height of this slice.
   * 
   * @type {number}
   * @protected
   */
  this._height = height;
  
  /**
   * @inheritDoc
   * @const
   */
  this._textureCoordinateMap = [

  0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0

  ];
  
  /**
   * A pointer to the parent volume of this slice.
   * 
   * @type {?X.volume}
   * @protected
   */
  this._volume = null;
  
  // create the slice
  this.create_();
  
};
// inherit from X.object
goog.inherits(X.slice, X.object);


/**
 * Create the slice.
 * 
 * @private
 */
X.slice.prototype.create_ = function() {

  this.points().clear();
  
  // get an orthogonal vector using front x up
  var frontVector = new goog.math.Vec3(this._front[0], this._front[1],
      this._front[2]);
  var upVector = new goog.math.Vec3(this._up[0], this._up[1], this._up[2]);
  var rightVector = goog.math.Vec3.cross(upVector, frontVector);
  var centerVector = new goog.math.Vec3(this._center[0], this._center[1],
      this._center[2]);
  
  // TODO generalize for arbitary slicing
  var sizeVector = new goog.math.Vec3(1, 1, 1);
  if (frontVector.x == 1) {
    sizeVector = new goog.math.Vec3(this._center[0], this._height / 2,
        this._width / 2);
    this._textureCoordinateMap = [0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0];
  } else if (frontVector.y == 1) {
    sizeVector = new goog.math.Vec3(this._width / 2, this._center[1],
        this._height / 2);
    this._textureCoordinateMap = [0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1];
  } else if (frontVector.z == 1) {
    sizeVector = new goog.math.Vec3(this._width / 2, this._height / 2,
        this._center[2]);
    // standard texture-coordinate-map
  }
  
  //
  // create the points like this:
  //
  // 1,5--4
  // |\..|
  // |.\.|
  // |..\|
  // 0---2,3
  var point0 = goog.math.Vec3.sum(rightVector.clone().invert(), upVector
      .clone().invert());
  point0 = new goog.math.Vec3(point0.x * sizeVector.x, point0.y * sizeVector.y,
      point0.z * sizeVector.z);
  point0.add(centerVector);
  
  var point1 = goog.math.Vec3.sum(rightVector.clone().invert(), upVector);
  point1 = new goog.math.Vec3(point1.x * sizeVector.x, point1.y * sizeVector.y,
      point1.z * sizeVector.z);
  point1.add(centerVector);
  
  var point2 = goog.math.Vec3.sum(rightVector, upVector.clone().invert());
  point2 = new goog.math.Vec3(point2.x * sizeVector.x, point2.y * sizeVector.y,
      point2.z * sizeVector.z);
  point2.add(centerVector);
  
  var point3 = point2;
  
  var point4 = goog.math.Vec3.sum(rightVector, upVector);
  point4 = new goog.math.Vec3(point4.x * sizeVector.x, point4.y * sizeVector.y,
      point4.z * sizeVector.z);
  point4.add(centerVector);
  
  var point5 = point1;
  
  // left triangle
  this.points().add(point0.x, point0.y, point0.z); // 0
  this.points().add(point1.x, point1.y, point1.z); // 1
  this.points().add(point2.x, point2.y, point2.z); // 2
  
  // right triangle
  this.points().add(point3.x, point3.y, point3.z); // 3
  this.points().add(point4.x, point4.y, point4.z); // 4
  this.points().add(point5.x, point5.y, point5.z); // 5
  
  // add the normals based on the orientation (we don't really need them since
  // we assume each Slice has a texture)
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  this.normals().add(frontVector.x, frontVector.y, frontVector.z);
  
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.slice', X.slice);

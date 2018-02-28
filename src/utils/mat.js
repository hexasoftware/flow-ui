import * as Rematrix from 'rematrix'

// Point
export default {
  identity: Rematrix.identity,
  multiply: Rematrix.multiply,
  inverse: Rematrix.inverse,

  translate: Rematrix.translate,
  rotate: Rematrix.rotate,
  scale: Rematrix.scale,
  multiplyPoint (mat, point) {
    const newPoint = new Array(4)
    // assuming point[3] == 1
    newPoint[0] =
    mat[0] * point[0] + mat[4] * point[1] + mat[8] * point[2] + mat[12]
    newPoint[1] =
    mat[1] * point[0] + mat[5] * point[1] + mat[9] * point[2] + mat[13]
    newPoint[2] =
    mat[2] * point[0] + mat[6] * point[1] + mat[10] * point[2] + mat[14]
    return newPoint
  }
}

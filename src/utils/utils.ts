export async function generateNewOTP() {
  var min = 100000;
  var max = 999999;
  return Math.floor((Math.random() * (max - min) + min));
}

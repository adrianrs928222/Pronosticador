function calculateEV(probabilidad, cuotas){
    return (probabilidad * cuotas) - 1;
}
module.exports = calculateEV;
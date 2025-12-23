function calculateEV(probability, odds){
    return (probability * odds) - 1;
}
module.exports = calculateEV;
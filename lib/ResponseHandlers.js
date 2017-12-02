function resolveMatches(param){
    return new Promise(function (resolve,reject){
        console.log('hello');
       //console.log(param)''
        //console.log(param.included)
        for (let i in param.included){

           //if (param.data.included[i].type === 'participant'){
               console.log(param.included[i])
           //}
        }
    });
}

function catchRESTexceptions(data){

}

module.exports.resolveMatches = resolveMatches;
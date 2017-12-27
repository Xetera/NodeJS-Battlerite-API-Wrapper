const handler = require('./ResponseHandlers');

const axios = require('axios');
const config = require('../config.json');



class Wrapper {
    constructor(token) {
        this.headers = {
            // headers for the requests that 'were going to be making
            "Authorization": token,
            "Accept": "application/vnd.api+json"
        };
        this.instance = axios.create({
            baseURL: config.requests.API_base_url,
            timeout: 1000,
            headers: this.headers
        })
    }
    static _invoke401(){
        return Wrapper.generateResponse(401, "Your token is not invalid.")
    }

    static generateResponse(status, response){
        return {
            status: status,
            response: response
        }
    }

    static filterQuery(){

    }

    getSteamID(name){
        return new Promise(function (resolve, reject){
            let req = axios.create({
                /* we're firing HTTP requests to an external API
                   to get the username information since the battlerite
                   API doesn't let us do that   */

                baseURL: `${config.requests.name_resolver_base_url}/${name}/`,
                timeout: 10000
            });
            req.get('lookup').then(function(response){
                if (response.data.status === 'success'){
                    resolve(Wrapper.generateResponse(response.data.status, response.data.player.user_id));
                }
            }).catch(function(error) {
                console.log(error);
                reject(Wrapper.generateResponse(error.data.status, ""))
            })
        })

    }

    getStatus() {
        return new Promise(function (resolve, reject){
            // we're getting the 'status' subsection of the
            wrapper.instance.get('status').then(function (res) {

                // just concerned with the initial number of the response
                let responseType = res.status.toString().charAt(0);
                if (responseType !== '2'){ // reject non 2xx responses

                    reject(Wrapper.generateResponse(res.status, "Something went wrong."))
                }

                resolve(Wrapper.generateResponse(200, "Battlerite servers are up and running."));

            }).catch(function (err) {
                console.log(err); // for debug only
                if (err.response.status === 401){
                    reject(Wrapper._invoke401())
                }
                else if (err.response.status === 403){
                    reject(Wrapper.generateResponse(403, "Forbidden"))
                }
                else {
                    reject(Wrapper.generateResponse(err.response.status, "Error"))
                }
            })
        });
    }

    getMatches(playerID=null){
        return new Promise(function(resolve, reject) {
            let endpoint = 'shards/global/matches/';
            if (playerID) {
                endpoint += `?filter[playerIds]=${playerID}`
            }
            console.log(config.requests.API_base_url + endpoint);
            wrapper.instance.get(endpoint).then(function (res) {
                if (res.status !== 200) {
                    // not sure what to do here since anything other than 200 throws error anyways
                }
                handler.resolveMatches(res.data).then(function (handlerResponse) {
                    resolve(handlerResponse)
                })

            }).catch(function (err) {
                if (err.response.status === 401){
                    reject(Wrapper._invoke401());
                }
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            })
        })
    }

}
let wrapper = new Wrapper(config.API_key);
/*
wrapper.getMatches().then(function (e){
  console.log(e);
}).catch(function (e){
    console.log(e);
});
*/




wrapper.getStatus('Deathmeter').then(function (id){
    console.log(id);
    wrapper.getMatches(id.response).then(function (response){
        //console.log(response);
    })
});

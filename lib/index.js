/* Third party */
const axios = require('axios');


/* Libs */
const handler = require('./ResponseHandlers');
const config = require('../config.json');
const endpoints = require('./Endpoints');



class Wrapper {
    constructor(token) {
        // headers for the requests that 'were going to be making
        this.headers = {
            "Authorization": token,
            "Accept": "application/vnd.api+json"
        };
        this.instance = axios.create({
            baseURL: endpoints.API_base_url, /* "https://api.dc01.gamelockerapp.com/" */
            timeout: 3000,
            headers: this.headers
        })
    }



    static _invoke401(){
        return Wrapper._generateResponse(401, "Your token is not invalid.")
    }

    /**
     *
     * @param status : number
     * @param response : string
     * @returns {{status: number, response: string}}
     * @private
     */
    static _generateResponse(status, response){

        return {
            status: status,
            response: response
        }
    }

    static filterQuery(){

    }

    async _convertIDtoName(steamID){
        //let name = await this.getPlayerInfo(steam)
    }

    /**
     * Summary: Attempts to retrieve Steam64 from a Steam username.
     * @param {string} name
     * @returns {Promise<{status: string, response: number}>}
     */
    getSteamID(name){
        return new Promise(function (resolve, reject){
            let req = axios.create({
                /* we're firing HTTP requests to an external API
                   to get the username information since the battlerite
                   API doesn't let us do that   */

                baseURL: `${endpoints.name_resolver_base_url}/${name}/`,
                timeout: 10000
            });
            req.get('lookup').then(function(response){
                if (response.data.status === 'success'){
                    resolve(response.data.player.user_id);
                }
            }).catch(function(error) {
                console.log(error);
                reject(Wrapper._generateResponse(error.data.status, ""))
            })
        })

    }



    /**
     * Summary: Returns the status of Battlerite API servers.
     * @returns {Promise}
     */
    getStatus() {
        return new Promise(function (resolve, reject){
            // we're getting the 'status' subsection of the
            wrapper.instance.get('status').then(function (res) {

                // just concerned with the initial number of the response
                let responseType = res.status.toString().charAt(0);
                if (responseType !== '2'){ // reject non 2xx responses

                    reject(Wrapper._generateResponse(res.status, "Something went wrong."))
                }

                resolve(Wrapper._generateResponse(200, "Battlerite servers are up and running."));

            }).catch(function (err) {
                console.log(err); // for debug only
                if (err.response.status === 401){
                    reject(Wrapper._invoke401())
                }
                else if (err.response.status === 403){
                    reject(Wrapper._generateResponse(403, "Forbidden"))
                }
                else {
                    reject(Wrapper._generateResponse(err.response.status, "Error"))
                }
            })
        });
    }

    /**
     *
     * Summary: Gets match data from given username or ID. Giving username forces
     * a conversion from name to ID using the API, taking up two call credits.
     *
     * @param playerName ?: string
     * @param playerID ?: number
     * @returns {Promise<any>}
     */
    async getMatches(playerID=null, playerName=null){

        if ((playerName == null) && (playerID == null)) {
            throw new SyntaxError("Must supple either a Steam username OR steam ID")
        }
        // if there's a name but not an ID
        if (playerName && !playerID){
            let response = await this.getPlayerInfo(playerName);
            // assigning
            playerID = response.attributes.id;
        }
        
        return new Promise(function(resolve, reject) {
            let endpoint = 'shards/global/matches/';
            if (playerID) {
                endpoint += `?filter[playerIds]=${playerID}`
            }
            else{

            }
            console.log(endpoints.API_base_url + endpoint);

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

    // we can create a different function for getting
    // playerS info taking in varargs
    async getPlayerInfo(playerName){
        let name = await this.getSteamID(playerName);

        return new Promise((resolve, reject) => {
            let endpoint = endpoints.API_base_url + endpoints.player_lookup + name;
            wrapper.instance.get(endpoint).then((response)=> {
                resolve(response.data);
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


let playerID = "";

wrapper.getSteamID('Deathmeter').then((response) => {
    console.log(response);
    playerID = response;

}).then(() => {
    wrapper.getMatches(playerID).then(function (id){
        console.log(id);

    });
});
*/
wrapper.getMatches



wrapper.getPlayerInfo("Deathmeter").then((response)=> {
    console.log(response.data);
});


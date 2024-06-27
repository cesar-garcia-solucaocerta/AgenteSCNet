const { app } = require('@azure/functions');

let mapPOS = new Map();
var id;
var estado;

app.http('SCNetData', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'SCNetData/{id:int?}',
    handler: async (request, context) => {
        context.log(`SCNetData:Http ${request.method} request for url "${request.url}"`);

        try{
            if (request.method=="GET") {
                // Obtem dados do POS
                id = request.query.get('id_pos') || await request.text() || '0000';
                context.log(`SCNetData:GET id_pos=${id}`);
                
                var posObj =  mapPOS.get(id);
                if (posObj) {
                    // POS encontrado
                    if (posObj.solicitacao != null) {
                        // Envia solicitação de pagamento para o POS
                        context.log(`SCNetData:GET pagamento (${id})=${posObj.Solicitacao}`)                        
                        posObj.ultimoGET =  new Date().getTime();
                        posObj.estadoPOS = "AGUARDACLIENTE"
                        mapPOS.set(id,posObj);
                        return { body: `${posObj.solicitacao}`}
                    }
                    else {
                        // Não há solicitação de pagamento para este pos. Atualiza ultimo Get
                        posObj.ultimoGET =  new Date().getTime();
                        mapPOS.set(id,posObj);
                        return { body: `{\"status\":\"204\",` +
                                       `\"id_pos\":\"` + `${id}\",` +
                                       `\"estado\":\"` + `${posObj.estado}\",` +
                                       `\"solicitacao\":\"\"}` 
                                    };
                    }
                }
                else {
                    // POS não encontrado. Retorna estado "INATIVO"
                    var posObj = new Object();
                    posObj.id_pos = id;
                    posObj.estado = "ATIVO";
                    mapPOS.set(id,posObj);
                    return { body: `{\"status\":\"204\",` + 
                                   `\"id_pos\":\"` + `${id}\",` + 
                                   `\"estado\":\"INATIVO\"}`};
                }
            }
            else  
                if (request.method=="POST") {
                    // Salva dados do POS
                    try {
                        const reqData = await request.text();
                        var reqObj = JSON.parse(reqData);
                        context.log(`SCNetData:POST:${reqData}`);
                        id = reqObj.id_pos;      
                        var posObj =  mapPOS.get(id);
                        if (!posObj) {
                            // Recebeu solicitação para POS INATIVO. Cria entrada
                            var posObj = new Object();
                            posObj.id_pos = id;
                            posObj.estado = "INATIVO"
                        }
                        posObj.ultimaSolicitacao =  new Date().getTime();
                        posObj.solicitacao = JSON.stringify(reqObj);
                        mapPOS.set(id,posObj);
                        return { body: `{\"status\":\"204\",\"id_pos\":\"` + `${id}\"}`};
                        // Dados do POS encontrados
                    }
                    catch(ex){
                        context.log(`SCNetData: Erro "${ex}"`);
                        return { body: `{\"status\":\"200\",\"id_pos\":\"` + `${id}\"}`};
                    }
                }
        }
        catch (ex){
            context.log(`SCNetData: Erro:"${ex}"`);
        }
    }
});
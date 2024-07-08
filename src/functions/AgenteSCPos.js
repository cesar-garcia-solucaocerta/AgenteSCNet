const { app } = require('@azure/functions');
//var http = require('http');

var http = require('http');
var httpAgent = new http.Agent();
httpAgent.maxSockets = 200;

var id;
let mapPOS = new Map();

app.http('SCNet', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'AgenteSCPos/pagamento/{id:int?}',
    handler: async (request, context) => {
        context.log(`AgenteSCPOS:Http ${request.method} request for url "${request.url}"`);

        try{
            var resultObj;
            if (request.method=="GET") {
                id = request.query.get('id_pos') || await request.text() || '0000';
                context.log(`AgenteSCPos:GET,id_pos=${id}`);
                // Obtem dados do POS em SCNetData
                var posObj =  mapPOS.get(id);
                if (posObj) {
                    // 
                    if (posObj.solicitacao != null) {
                        // Envia solicitação de pagamento para o POS
                        context.log(`AgenteSCPos:GET pagamento (${id})=${posObj.Solicitacao}`)                        
                        posObj.ultimoGET =  new Date().getTime();
                        posObj.estadoPOS = "ATIVO";
                        posObj.estadoPagamento = "SOLICITADO";
                        mapPOS.set(id,posObj);
                        return { body: `${posObj.Solicitacao}`}
                    }
                    else {
                        // Não há solicitação de pagamento para este pos. Atualiza ultimo Get
                        posObj.ultimoGET =  new Date().getTime();
                        posObj.estadoPOS = "ATIVO";
                        posObj.estadoPagamento = "LIVRE";
                        mapPOS.set(id,posObj);
                        return { body: `{\"status\":\"204\",\"id_pos\":\"` + `${id}\"}`};
                    }
                }
                else {
                    // POS ativo. Insere no mapPOS
                    var posObj = new Object();
                    posObj.id_pos =  id;
                    posObj.ultimoGET =  new Date().getTime();
                    var dateNow = new Date(posObj.ultimoGET).toString();
                    posObj.estadoPOS = "ATIVO"
                    posObj.estadoPagamento = "LIVRE";
                    mapPOS.set(id,posObj);
                    context.log(`AgenteSCPos:GET: id_pos=${posObj.id_pos}, time=${dateNow}`);
                    return { body: `{\"status\":\"204\",\"id_pos\":\"` + `${id}\"}`};
                }
                    
            }
            else  
                if (request.method=="POST") {
                    // Informações de Pagamento concluído no POS
                    try {
                        const reqData = await request.text();
                        context.log(`AgenteSCPos:POST pagamento:${reqData}`);
                        var reqObj = JSON.parse(reqData);

                        if (reqObj.action == "PagarCartaoPOS" ) {
                            var id_pos = reqObj.id_pos;
                            var result;
                            // Recebeu solicitação de pagamento da aplicação    
                            // Salva para enviar para o POS no GET
                            var posObj = mapPOS.get(id_pos);
                            //if (!posObj) {posObj = new Object();posObj.id_pos = id_pos;}
                            // POS está na rede
                            if (posObj){
                                if (posObj.estadoPOS == "ATIVO") {
                                    // POS ativo
                                    posObj.estadoPagamento = "SOLICITADO";
                                    posObj.solicitacao = reqData;
                                    posObj.ultimaSOlicitacao =  new Date().toDateString();
                                    mapPOS.set(id_pos,posObj);
                                    return { body: `{\"status\":\"204\"}`};
                                }
                                else {
                                    //POS INATIVO ou ocupado Return "NOT ACCETABLE"
                                    return { body: `{\"status\":\"406\",\"msgErro\":\"|POS ${id_pos} inativo\"}`};
                                }
                            }
                            else {
                                //POS não encontrado. Return "NOT ACCETABLE"
                                return { body: `{\"status\":\"406\",\"msgErro\":\"|POS ${id_pos} inativo\"}`};
                            }
                        }

                        // Recebeu informações de pagamento realizado no POS
                        context.log(`AgenteSCPos:Pagamento recebido.id_pos=${reqObj.id_pos}`);
                        return { body: `{\"status\":\"200\",\"id_pos\":\"` + `${id}\"}`};
                    }
                    catch(ex){
                        context.log(`AgenteSCPos: Erro "${ex}"`);
                        return { body: `{\"status\":\"200\",\"id_pos\":\"` + `${id}\"}`};
                    }
                }
        }
        catch (ex){
            context.log(`AgenteSCPos: Erro em POST \pagamento:"${ex}"`);
        }
    }
});


''
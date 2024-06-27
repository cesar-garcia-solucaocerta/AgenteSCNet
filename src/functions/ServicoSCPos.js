const { app } = require('@azure/functions');

const mapPOS = require('./SCNetData');

//let mapPOS = new Map();
//ServicoSCPos.exports = { mapPOS };
//const mapPOS = require('src/functions/SCNetData.js');



app.http('ServicoSCPos', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        
        try {
            context.log(`Http function processed request for url "${request.url}"`);
            const reqData = await request.text();
            var reqObj = JSON.parse(reqData);
            context.log(`ServicoSCPos.Received POST:${reqData}`);

            var id_pos = reqObj.id_pos;
            var posObj = mapPOS.get(id_pos);
            if (!posObj) {posObj = new Object();posObj.id_pos = id_pos;}
            if (posObj){
                // POS ativo
                posObj.estadoHOST = "AGUARDA_PAGAMENTO";
                posObj.solicitacao = reqData;
                posObj.ultimaSOlicitacao =  new Date().toDateString();
                mapPOS.set(id_pos,posObj);
                return { body: `{\"status\":\"204\"}`};
            }
            else {
                //POS inativo. Return "NOT ACCETABLE"
                return { body: `{\"status\":\"406\",\"msgErro\":\"|POS ${id_pos} inativo\"}`};
            }
        }
        catch (ex) {
            // Erro no processamento.Retorna ""Request Timeout"
            context.log(`AgenteSCNet: Erro "${ex}"`);
            return { body: `{\"status\":\"408\"}`};
        }
    }
});
function  getPOS(){
    
}

''
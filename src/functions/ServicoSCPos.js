const { app } = require('@azure/functions');
var http = require('http');

let mapPOS = new Map();

app.http('ServicoSCPos', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        
        try {
            context.log(`ServicoSCPos:Http function processed request for url "${request.url}"`);
            const reqData = await request.text();
            var reqObj = JSON.parse(reqData);
            context.log(`ServicoSCPos.Received POST:${reqData}`);

            var id_pos = reqObj.id_pos;
            var result;
            /*var client = new XMLHttpRequest();
            var authentication = 'Bearer ...'
            var url = "http://localhost:7071/api/SCNetData/";
            var data = JSON.stringify(reqObj);
            client.open("POST", url, true);
            //client.setRequestHeader('Authorization',authentication); 
            client.setRequestHeader('Content-Type', 'application/json');
            client.send(data);
            */
            var http_options = {
//                hostname: 'localhost',
                hostname: '10.0.0.110',
                port: 7071,
                path: '/api/SCNetData',
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': reqData.length
                }
            };
            var body = '';
            context.log('ServicoSCPos:before request');
            var  request = http.request(http_options, function (res) {
                res.setEncoding('utf8');
                body = '';
                context.log('ServicoSCPos:inside request');
                res.on('data', (chunk) => {
                    body = body + chunk;
                });
                context.log('ServicoSCPos:in req 2');
                res.on('end', () => {
                    var options = {
                            compact: false,
                            ignoreComment: false,
                            spaces: 1
                    };
                    result = JSON.parse(body);
                });
            });
            
            context.log("ServicoSCPos:resp POST=" + JSON.stringify(result));
            request.write(reqData);
            request.end();

            
            /*
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
            */
        }
        catch (ex) {
            // Erro no processamento.Retorna ""Request Timeout"
            context.log(`ServicoSCPos: Erro "${ex}"`);
            return { body: `{\"status\":\"408\"}`};
        }
    }
});
''
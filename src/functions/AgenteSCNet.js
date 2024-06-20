const { app } = require('@azure/functions');

/*
app.http('AgenteSCNet', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
*/

var pos = new Object();
pos.id = "0999";
pos.state = "inativo";

var reqPagamento = `{
                action: 'PagarCartaoPOS',
                id_pos: '00001',
                id_pdv: '01000',
                id_pagamento: '1',
                valor: '1.00',
                tipo_pagamento: '2',
                numero_parcelas: '1',
                detalhes: ''
              }`;

var respPagamentoJson = `{
                id_pos: '00002',
                id_pdv: '01000',
                id_pagamento: '3',
                id_pagamento_safra: '1718909829735',
                codigo_retorno: '0',
                codigo_resposta_autorizadora: '000',
                codigo_erro: '0',
                valor: '100',
                tipo_pagamento: '2',
                operacao_realizada: 'VENDA_DEBITO',
                nsu_autorizadora: '020015745341',
                numero_cartao: '************0021',
                nsu_ctf: '172187',
                codigo_aprovacao: '235521',
                numero_parcelas: '1',
                bandeira: '00001',
                redeAutorizadora: '00296',
                datahora: '20/06/202415:57:21',
                adquirente: 'SAFRAPAY',
                codigoAutorizadora: '',
                terminal: '10003827',
                msg_cliente: '',
                recibo_pagamento: 'TERM=10003827             DOC=172187\n' +
                  '------------------------------------\n' +
                  'm20/06/2024         15:57:21    ONL-C\n' +
                  'CARTAO:             ************0021\n' +
                  'mDEBITO A VISTA                     \n' +
                  'iVALOR:      R$1.00\n' +
                  '------------------------------------\n' +
                  'mNSU=20015745341        AUT=235521\n' +
                  'eA                               \n' +
                  's                                 \n' +
                  '                                 VDTERM=10003827             DOC=172187\n' +
                  '------------------------------------\n' +
                  'm20/06/2024         15:57:21    ONL-C\n' +
                  'CARTAO:             ************0021\n' +
                  'mDEBITO A VISTA                     \n' +
                  'iVALOR:      R$1.00\n' +
                  '------------------------------------\n' +
                  'mNSU=20015745341        AUT=235521\n' +
                  '                                 V\n'
              }`;

var listaPOS = [pos];
var id;

app.http('AgenteSCNet', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'AgenteSCNet/pagamento/{id:int?}',
    handler: async (request, context) => {
        context.log(`AgenteSCNet:Http ${request.method} request for url "${request.url}"`);

        try{
            if (request.method=="GET") {
                id = request.query.get('id_pos') || await request.text() || '0000';
                context.log(`AgenteSCNet:id_pos=${id}`);
                if (id == "0001") {
                    return { body: `${reqPagamento}`};
                }
                return { body: `{\"status\":\"204\",\"id_pos\":\"` + `${id}\"}`};
            }
            else  
                if (request.method=="POST") {
                    // Informações de Pagamento concluído no POS
                    try {
                        const requestData = await request.json();
                        //const obj = JSON.parse(requestData);
                        context.log( `AgenteSCNet:POST body=${requestData}`)

                        return { body: `{\"status\":\"200\",\"id_pos\":\"` + `${id}\"}`};
                    }
                    catch(ex){
                        context.log(`AgenteSCNet: Erro "${ex}"`);
                        return { body: `{\"status\":\"200\",\"id_pos\":\"` + `${id}\"}`};
                    }
                }
        }
        catch (ex){
            context.log(`AgenteSCNet: Erro em POST \pagamento:"${ex}"`);
        }
    }
});

''
const { app } = require('@azure/functions');


app.http('ServicoSCPos', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        context.log(`Body= "${request.body}"`);
      
        return { body: `{\"status\":\"204\"}`};
    }
});

''
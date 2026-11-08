// Teste do núcleo sem gastar com IA (respostas simuladas e um servidor local
// no lugar da API do Claude). Rodar: cd functions && npm ci && node teste-nucleo.js
const path=__dirname+'/';
const n=require(path+'nucleo'); const Anthropic=require(path+'node_modules/@anthropic-ai/sdk'); const http=require('http');
const out={};
// 1. validação
const base={acao:'gerar',provedor:'gemini',taxonomia:[{materia:'Direito Civil',divisoes:['Introdução ao Direito Civil e LINDB','Parte Geral: Pessoas']},{materia:'Direito Penal',divisoes:['Parte Geral']}],tema:'Vacatio legis',material:''};
out.valido=!!n.validarPedido(base);
for (const [k,v] of [['acao','x'],['provedor','gpt'],['taxonomia',[]]]) { try{ n.validarPedido(Object.assign({},base,{[k]:v})); out['erro_'+k]='NÃO RECUSOU'; }catch(e){ out['erro_'+k]=e.message; } }
try{ n.validarPedido(Object.assign({},base,{material:'x'.repeat(300001)})); }catch(e){ out.limite=e.message; }
out.prompt=n.mensagemUsuario(n.validarPedido(base)).slice(0,160);
// 2. saída
const ficha={materia:'Direito Civil',divisao:'Introdução ao Direito Civil e LINDB',titulo:'Vacatio legis',subtema:'Vigência',tipo:'requisitos e prazos',referencia:'art. 1º da LINDB',corpo_html:'<table><tr><th>A</th><th>B</th></tr>\n<tr><td>1</td><td>2</td></tr></table>',alerta:'45 dias',fonte:'X'};
out.saida=n.validarSaida('gerar',{fichas:[ficha,{titulo:'sem corpo',divisao:'d',tipo:'Rol',corpo_html:'texto'},{titulo:'tipo errado',divisao:'d',tipo:'Outro',corpo_html:'<p>x</p>'}],observacoes:'ok'});
out.lerJsonCerca=n.lerJson('```json\n{"a":1}\n```').a;
// 3. Gemini simulado
(async()=>{
 const fakeFetch=async(url,o)=>({ok:true,status:200,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({fichas:[ficha],observacoes:''})}]}}],usageMetadata:{promptTokenCount:1000,candidatesTokenCount:500,thoughtsTokenCount:200}}), _url:url});
 const g=await n.chamarGemini(fakeFetch,{modelo:'gemini-3.8-flash',chave:'k'},n.validarPedido(base)); out.gemini={fichas:g.json.fichas.length,uso:g.uso};
 // 4. Claude: captura a requisição num servidor local
 let capt=null; const srv=http.createServer((req,res)=>{ let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ capt={url:req.url, headers:{beta:req.headers['anthropic-beta'], versao:req.headers['anthropic-version'], chave:req.headers['x-api-key']}, body:JSON.parse(b)}; res.writeHead(400,{'content-type':'application/json'}); res.end(JSON.stringify({type:'error',error:{type:'invalid_request_error',message:'simulado'}})); }); }).listen(0);
 await new Promise(r=>srv.on('listening',r));
 const cli=new Anthropic({apiKey:'sk-teste',baseURL:'http://127.0.0.1:'+srv.address().port,maxRetries:0});
 try{ await n.chamarClaude(cli,{modelo:'claude-opus-5-5',esforco:'medium'},n.validarPedido(Object.assign({},base,{acao:'planejar',material:'Art. 1º ...'}))); }catch(e){ out.claudeErro=e.constructor.name+' '+e.status; }
 srv.close();
 out.claudeReq={url:capt.url, headers:capt.headers, model:capt.body.model, stream:capt.body.stream, fallbacks:capt.body.fallbacks, effort:capt.body.output_config.effort, formato:capt.body.output_config.format.type, temSchema:!!capt.body.output_config.format.schema.properties.fichas, system:capt.body.system.slice(0,40), max_tokens:capt.body.max_tokens};
 console.log(JSON.stringify(out,null,1));
})();

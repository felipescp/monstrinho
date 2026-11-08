/**
 * A Salinha — aviso por e-mail de pedidos de acesso (Google Apps Script).
 *
 * Níveis: no 1º login a conta já nasce no acesso simples (acessos/{e-mail}
 * com "nivel": "simples"). Quem está no acesso simples pode clicar em "Pedir
 * acesso completo", o que grava "pedidoCompletoEm" no documento. Este
 * script, rodando na SUA conta Google (dona do projeto monstrinho-lab),
 * confere a cada 10 minutos e manda um e-mail com:
 *   - os PEDIDOS DE ACESSO COMPLETO novos (o que pede ação sua);
 *   - as CONTAS NOVAS no acesso simples (só para saber; já estão liberadas);
 *   - pedidos antigos ainda pendentes ("ativo": false sem nível).
 * Cada item é avisado uma vez só.
 *
 * Não precisa de servidor, senha de e-mail nem plano pago: usa a sua própria
 * permissão no projeto e o Gmail da sua conta. Instalação: ver a seção
 * "Aviso por e-mail de pedidos de acesso" em LEIAME-firebase.md.
 *
 * Funções:
 *   - verificarPedidos(): a conferência (é a que o acionador chama).
 *   - instalarAcionador(): cria o acionador de 10 em 10 minutos (rodar 1 vez).
 *   - testarAviso(): manda um e-mail de teste com a situação atual.
 */
var PROJETO = 'monstrinho-lab';
var CHAVE_AVISADOS = 'avisados';

function verificarPedidos() {
  var itens = lerItens_();
  var props = PropertiesService.getScriptProperties();
  var avisados = {};
  try { avisados = JSON.parse(props.getProperty(CHAVE_AVISADOS) || '{}') || {}; } catch (e) { avisados = {}; }

  var novos = itens.filter(function(it) { return !avisados[it.chave]; });
  if (novos.length) enviarEmail_(novos, false);

  // Guarda só o que ainda está valendo (pedido atendido sai da lista).
  var atual = {};
  itens.forEach(function(it) { atual[it.chave] = avisados[it.chave] || new Date().toISOString(); });
  props.setProperty(CHAVE_AVISADOS, JSON.stringify(atual));
  return novos.length;
}

function testarAviso() {
  var itens = lerItens_();
  enviarEmail_(itens, true);
  return itens.length;
}

function instalarAcionador() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'verificarPedidos') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('verificarPedidos').timeBased().everyMinutes(10).create();
}

// Lê acessos/ e separa o que interessa avisar:
//   tipo "completo": acesso simples com pedidoCompletoEm (chave muda a cada pedido);
//   tipo "novo":     conta no acesso simples (aviso único, informativo);
//   tipo "pendente": pedido antigo, "ativo": false sem nível.
// Contas completas, bloqueadas e o admin não entram.
function lerItens_() {
  var url = 'https://firestore.googleapis.com/v1/projects/' + PROJETO + '/databases/(default)/documents:runQuery';
  var corpo = { structuredQuery: { from: [{ collectionId: 'acessos' }] } };
  var r = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(corpo),
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      // A cota da chamada vai para o próprio projeto (não para o do script).
      'x-goog-user-project': PROJETO
    },
    muteHttpExceptions: true
  });
  if (r.getResponseCode() !== 200) {
    throw new Error('Firestore respondeu ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
  }
  var linhas = JSON.parse(r.getContentText()) || [];
  var itens = [];
  linhas.forEach(function(l) {
    if (!l.document) return;
    var nome = l.document.name;
    var email = decodeURIComponent(nome.substring(nome.lastIndexOf('/') + 1));
    var f = l.document.fields || {};
    var ativo = f.ativo && f.ativo.booleanValue === true;
    var nivel = f.nivel && f.nivel.stringValue;
    var papel = f.papel && f.papel.stringValue;
    var quando = function(campo) { return f[campo] && f[campo].timestampValue ? new Date(f[campo].timestampValue) : null; };
    var criado = quando('pedidoEm') || (l.document.createTime ? new Date(l.document.createTime) : null);
    if (papel === 'admin') return;
    if (ativo && nivel === 'simples') {
      var pc = quando('pedidoCompletoEm');
      if (pc) itens.push({ tipo: 'completo', email: email, quando: pc, chave: 'completo:' + email + ':' + pc.getTime() });
      itens.push({ tipo: 'novo', email: email, quando: criado, chave: 'novo:' + email });
    } else if (!ativo && !nivel) {
      itens.push({ tipo: 'pendente', email: email, quando: criado, chave: 'pendente:' + email });
    }
  });
  itens.sort(function(a, b) { return (a.quando || 0) - (b.quando || 0); });
  return itens;
}

function enviarEmail_(itens, teste) {
  var destino = Session.getEffectiveUser().getEmail();
  var fuso = Session.getScriptTimeZone() || 'America/Sao_Paulo';
  var linkDoc = function(email) {
    return 'https://console.firebase.google.com/project/' + PROJETO +
      '/firestore/databases/-default-/data/~2Facessos~2F' + encodeURIComponent(email);
  };
  var esc = function(t) { return String(t).replace(/[&<>"]/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var data = function(d) { return d ? Utilities.formatDate(d, fuso, 'dd/MM/yyyy HH:mm') : '—'; };
  var grupo = function(tipo) { return itens.filter(function(it) { return it.tipo === tipo; }); };
  var lista = function(gs) {
    return '<ul>' + gs.map(function(it) {
      return '<li><b>' + esc(it.email) + '</b> — ' + data(it.quando) + ' — <a href="' + linkDoc(it.email) + '">abrir no console</a></li>';
    }).join('') + '</ul>';
  };
  var completos = grupo('completo'), novos = grupo('novo'), pendentes = grupo('pendente');

  var assunto;
  if (teste) assunto = 'A Salinha: teste do aviso';
  else if (completos.length === 1) assunto = 'A Salinha: pedido de acesso completo — ' + completos[0].email;
  else if (completos.length > 1) assunto = 'A Salinha: ' + completos.length + ' pedidos de acesso completo';
  else if (pendentes.length) assunto = 'A Salinha: ' + pendentes.length + ' pedido(s) de acesso pendente(s)';
  else assunto = 'A Salinha: ' + (novos.length === 1 ? 'nova conta no acesso simples — ' + novos[0].email : novos.length + ' novas contas no acesso simples');

  var html = (teste ? '<p><i>E-mail de teste: situação atual.</i></p>' : '');
  if (completos.length) html += '<h3 style="margin:12px 0 4px">Pedidos de acesso completo</h3>' + lista(completos) +
    '<p>Para liberar: abra o documento, mude <b>nivel</b> para <b>completo</b> e salve (opcional: <b>expiraEm</b> com a validade).</p>';
  if (pendentes.length) html += '<h3 style="margin:12px 0 4px">Pedidos antigos pendentes</h3>' + lista(pendentes) +
    '<p>Viram acesso simples sozinhos no próximo login da pessoa. Para dar o completo já: <b>ativo</b> = true e <b>nivel</b> = completo.</p>';
  if (novos.length) html += '<h3 style="margin:12px 0 4px">Novas contas no acesso simples</h3>' + lista(novos) +
    '<p style="color:#555">Já liberadas no acesso simples (todas as baterias e materiais associados). Nada a fazer.</p>';
  if (!itens.length) html += '<p><i>Nenhum pedido nem conta nova.</i></p>';
  html += '<p style="color:#777;font-size:12px">Aviso enviado pelo script "A Salinha — aviso de pedidos" (Google Apps Script) da sua conta.</p>';
  var texto = itens.map(function(it) { return it.tipo + ': ' + it.email + ' (' + data(it.quando) + ')'; }).join('\n') || 'Nada novo.';
  MailApp.sendEmail({ to: destino, subject: assunto, htmlBody: html, body: texto, name: 'A Salinha' });
}

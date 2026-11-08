/**
 * A Salinha — aviso por e-mail de pedidos de acesso (Google Apps Script).
 *
 * Quando alguém entra com a conta Google e ainda não tem acesso, o site cria
 * acessos/{e-mail} no Firestore com "ativo": false. Este script, rodando na
 * SUA conta Google (dona do projeto monstrinho-lab), confere esses pedidos a
 * cada 10 minutos e manda um e-mail para você com os novos, com o link para
 * liberar no console.
 *
 * Não precisa de servidor, senha de e-mail nem plano pago: usa a sua própria
 * permissão no projeto e o Gmail da sua conta. Instalação: ver a seção
 * "Aviso por e-mail de pedidos de acesso" em LEIAME-firebase.md.
 *
 * Funções:
 *   - verificarPedidos(): a conferência (é a que o acionador chama).
 *   - instalarAcionador(): cria o acionador de 10 em 10 minutos (rodar 1 vez).
 *   - testarAviso(): manda um e-mail de teste com os pedidos pendentes atuais.
 */
var PROJETO = 'monstrinho-lab';
var CHAVE_AVISADOS = 'avisados';

function verificarPedidos() {
  var pendentes = lerPendentes_();
  var props = PropertiesService.getScriptProperties();
  var avisados = {};
  try { avisados = JSON.parse(props.getProperty(CHAVE_AVISADOS) || '{}') || {}; } catch (e) { avisados = {}; }

  var novos = pendentes.filter(function(p) { return !avisados[p.email]; });
  if (novos.length) enviarEmail_(novos, pendentes.length, false);

  // Guarda só quem ainda está pendente: se a pessoa for liberada e depois
  // desativada e pedir de novo, volta a avisar.
  var atual = {};
  pendentes.forEach(function(p) { atual[p.email] = avisados[p.email] || new Date().toISOString(); });
  props.setProperty(CHAVE_AVISADOS, JSON.stringify(atual));
  return novos.length;
}

function testarAviso() {
  var pendentes = lerPendentes_();
  enviarEmail_(pendentes, pendentes.length, true);
  return pendentes.length;
}

function instalarAcionador() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'verificarPedidos') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('verificarPedidos').timeBased().everyMinutes(10).create();
}

// Pedidos com "ativo": false (mais antigos primeiro).
function lerPendentes_() {
  var url = 'https://firestore.googleapis.com/v1/projects/' + PROJETO + '/databases/(default)/documents:runQuery';
  var corpo = {
    structuredQuery: {
      from: [{ collectionId: 'acessos' }],
      where: { fieldFilter: { field: { fieldPath: 'ativo' }, op: 'EQUAL', value: { booleanValue: false } } }
    }
  };
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
  var lista = [];
  linhas.forEach(function(l) {
    if (!l.document) return;
    var nome = l.document.name;
    var email = decodeURIComponent(nome.substring(nome.lastIndexOf('/') + 1));
    var f = l.document.fields || {};
    var quando = (f.pedidoEm && f.pedidoEm.timestampValue) || l.document.createTime;
    lista.push({ email: email, pedidoEm: quando ? new Date(quando) : null });
  });
  lista.sort(function(a, b) { return (a.pedidoEm || 0) - (b.pedidoEm || 0); });
  return lista;
}

function enviarEmail_(novos, totalPendentes, teste) {
  var destino = Session.getEffectiveUser().getEmail();
  var fuso = Session.getScriptTimeZone() || 'America/Sao_Paulo';
  var linkDoc = function(email) {
    return 'https://console.firebase.google.com/project/' + PROJETO +
      '/firestore/databases/-default-/data/~2Facessos~2F' + encodeURIComponent(email);
  };
  var esc = function(t) { return String(t).replace(/[&<>"]/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var data = function(d) { return d ? Utilities.formatDate(d, fuso, 'dd/MM/yyyy HH:mm') : '—'; };

  var assunto = teste
    ? 'A Salinha: teste do aviso (' + totalPendentes + ' pedido(s) pendente(s))'
    : (novos.length === 1 ? 'A Salinha: novo pedido de acesso — ' + novos[0].email
                          : 'A Salinha: ' + novos.length + ' novos pedidos de acesso');
  var itens = novos.map(function(p) {
    return '<li><b>' + esc(p.email) + '</b> — pedido em ' + data(p.pedidoEm) +
      ' — <a href="' + linkDoc(p.email) + '">abrir no console</a></li>';
  }).join('');
  var html = '<p>' + (teste ? 'E-mail de teste. Pedidos pendentes agora:' : 'Novo(s) pedido(s) de acesso pelo site:') + '</p>' +
    (itens ? '<ul>' + itens + '</ul>' : '<p><i>Nenhum pedido pendente.</i></p>') +
    '<p>Para liberar: abra o documento, mude <b>ativo</b> para <b>true</b> e salve ' +
    '(opcional: <b>expiraEm</b> com a data de validade).</p>' +
    '<p style="color:#777;font-size:12px">Total pendente: ' + totalPendentes + '. ' +
    'Aviso enviado pelo script "A Salinha — aviso de pedidos" (Google Apps Script) da sua conta.</p>';
  var texto = (teste ? 'Teste. ' : '') + 'Pedidos: ' + novos.map(function(p) { return p.email + ' (' + data(p.pedidoEm) + ')'; }).join(', ');
  MailApp.sendEmail({ to: destino, subject: assunto, htmlBody: html, body: texto, name: 'A Salinha' });
}

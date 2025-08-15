<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 2 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **90.7/100**

Olá, Gabriel! 👋🚀

Primeiramente, parabéns pelo esforço e pelo excelente trabalho que você entregou até aqui! 🎉 Sua API está bem estruturada, com uma organização clara entre rotas, controllers e repositories, e você fez um ótimo uso do Knex.js para interagir com o PostgreSQL. Além disso, adorei ver que você implementou validações detalhadas e mensagens de erro customizadas — isso deixa sua API muito mais robusta e amigável para quem a consome! 👏

Também quero destacar que você conseguiu implementar alguns recursos bônus importantes, como a filtragem de casos por status e por agente, o que mostra que você está indo além do básico e explorando bem o potencial do projeto. Isso é muito legal! 😄

---

### Agora, vamos aos pontos que precisam de atenção para você deixar sua API ainda mais completa e alinhada com o esperado. Vou destrinchar para você entender a raiz dos problemas e como corrigi-los, beleza? 🕵️‍♂️🔍

---

## 1. Sobre a falha no DELETE de agentes

Você implementou corretamente a lógica para impedir a exclusão de agentes que possuem casos associados, o que é ótimo para manter a integridade do banco. Porém, percebi que o teste de exclusão do agente falha. Isso pode indicar que o endpoint DELETE `/agentes/:id` não está conseguindo apagar um agente que **não tem casos associados**.

Ao analisar seu método `deleteAgente` no `agentesController.js`, temos:

```js
async function deleteAgente(req, res) {
    const { id } = req.params;

    if(await casosRepository.listarCasosPorAgente(id)) {
        return res.status(400).json(errorHandler.handleError(400, "Agente com Casos", "agenteComCasos", "Agente não pode ser excluído enquanto tiver casos associados."));
    }

    const status = await agentesRepository.apagarAgente(id);

    if (!status) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    } 
    
    res.status(204).send();
}
```

Aqui, o problema está na verificação:

```js
if(await casosRepository.listarCasosPorAgente(id)) {
```

No seu `casosRepository.js`, a função `listarCasosPorAgente` retorna **false** quando não encontra casos:

```js
async function listarCasosPorAgente(agente_id) {
    try {
        const casos = await db("casos").where({agente_id:agente_id})

        if (!casos || casos.length === 0){
            return false;
        }

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}
```

Ou seja, se o agente **não tem casos**, essa função retorna `false`. Porém, na sua condição do controller, o `if` avalia `if (false)` e não entra no bloco, o que está correto.

Então, por que a exclusão pode falhar?

O problema pode estar na função `apagarAgente` do `agentesRepository.js`:

```js
async function apagarAgente(id) {
    try {
        const agente = await db("agentes").where({id:id}).del();

        if (!agente || agente === 0){
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}
```

Aqui, você retorna `false` se `agente` (que na verdade é o número de linhas deletadas) for zero ou falsy, o que está correto.

**Possível causa raiz:** 

- Se o id passado não existe, `del()` retorna 0 e você retorna false — correto.
- Se o id existe e não tem casos, a exclusão deve acontecer e retornar true.

Se a exclusão não está funcionando, pode ser que o id passado seja inválido ou que o banco não esteja atualizando corretamente.

**Sugestão para investigação:**

- Verifique se o id passado realmente existe no banco antes de tentar deletar.
- Adicione um log para verificar o valor retornado por `del()`.

Exemplo de melhoria para o controller, para garantir que o id é um número e existe:

```js
async function deleteAgente(req, res) {
    const { id } = req.params;

    if (isNaN(Number(id))) {
        return res.status(400).json(errorHandler.handleError(400, "ID inválido", "idInvalido", "O ID deve ser um número."));
    }

    if(!await agentesRepository.encontrarAgenteById(id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    }

    if(await casosRepository.listarCasosPorAgente(id)) {
        return res.status(400).json(errorHandler.handleError(400, "Agente com Casos", "agenteComCasos", "Agente não pode ser excluído enquanto tiver casos associados."));
    }

    const status = await agentesRepository.apagarAgente(id);

    if (!status) {
        return res.status(500).json(errorHandler.handleError(500, "Erro interno", "erroInterno", "Não foi possível deletar o agente."));
    } 
    
    res.status(204).send();
}
```

Isso deixa o fluxo mais seguro e explícito.

---

## 2. Sobre o erro de status 400 ao criar caso com payload incorreto

No `casosController.js`, você tem essa validação no `postCaso`:

```js
if(titulo.trim() === "" || descricao.trim() === "" || status.trim() === "" || String(agente_id).trim() === "") {
    return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
}
```

Esse trecho assume que `titulo`, `descricao`, `status` e `agente_id` sempre existem no corpo da requisição, mas se algum deles for `undefined` ou `null`, acessar `.trim()` vai gerar um erro, porque `undefined.trim()` não é válido.

**Causa raiz:** Falta de validação para garantir que os campos existem antes de usar `.trim()`.

**Como corrigir:**

Faça uma validação mais segura, verificando se o campo existe antes de chamar `.trim()`. Exemplo:

```js
if (
    !titulo || typeof titulo !== 'string' || titulo.trim() === "" ||
    !descricao || typeof descricao !== 'string' || descricao.trim() === "" ||
    !status || typeof status !== 'string' || status.trim() === "" ||
    agente_id === undefined || agente_id === null || String(agente_id).trim() === ""
) {
    return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
}
```

Assim você evita erros inesperados e garante que o payload está no formato correto.

---

## 3. Falhas nos testes bônus relacionados a filtros e buscas

Você implementou várias funcionalidades extras, mas algumas delas não passaram, como:

- Busca do agente responsável por um caso
- Filtragem de casos por keywords no título/descrição
- Filtragem de agentes por data de incorporação com sorting asc e desc
- Mensagens de erro customizadas para argumentos inválidos

### Sobre a filtragem por data de incorporação com sorting

No `agentesController.js` você tem:

```js
if (sort) {
    if (sort !== "dataDeIncorporacao" && sort !== "-dataDeIncorporacao") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de Sort Inválido", "tipoSortInvalido", "Tipo de sort inválido. Selecionar 'dataDeIncorporacao' ou '-dataDeIncorporacao'."));
    }

    const dados = await agentesRepository.listarDataDeIncorporacao(sort)

    if (!dados || dados.length === 0) {
        return res.status(404).json(errorHandler.handleError(404, "Nenhum agente encontrado", "agenteNaoEncontrado", "Nenhum agente foi encontrado com esse filtro."));
    }

    return res.status(200).json(dados)
}
```

E no `agentesRepository.js`:

```js
async function listarDataDeIncorporacao(sort) {
    try {
        if (sort === "dataDeIncorporacao") {
            const agentes = await db("agentes").orderBy("dataDeIncorporacao", "asc");
            return agentes.map(agente => formatarData(agente));
        } else if (sort === "-dataDeIncorporacao") {
            const agentes = await db("agentes").orderBy("dataDeIncorporacao", "desc");
            return agentes.map(agente => formatarData(agente));
        }

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}
```

Aqui está tudo certo na lógica, porém, a forma como o parâmetro `sort` é passado na query pode estar interferindo. Por exemplo, se você passar `?sort=-dataDeIncorporacao`, o valor vem com o `-` e você está tratando isso, mas dependendo do cliente HTTP, o `-` pode ser interpretado de forma diferente.

**Sugestão:** Para garantir maior robustez, normalize o parâmetro `sort` antes de usar, e valide o valor sem espaços extras.

---

### Sobre a busca de casos por palavra-chave

No `casosRepository.js`, a função:

```js
async function encontrarCasoPorString(search) {
    try {
        const casos = await db("casos")
            .whereILike("titulo", `%${search}%`)
            .orWhereILike("descricao", `%${search}%`)

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}
```

Está correta, porém, verifique se no controller você está tratando corretamente o caso em que `q` é vazio ou não informado:

```js
if(!q || q.trim() === "") {
    return res.status(400).json(errorHandler.handleError(400, "Parâmetro não encontrado", "parametroNaoEncontrado", "Verifique se está utilizando o parametro 'q' e se colocou alguma palavra para buscar."));
}
```

Aqui está ótimo! Então, o problema pode estar no retorno do `false` do repositório caso ocorra erro, que no controller pode não estar sendo tratado corretamente.

---

### Sobre mensagens de erro customizadas para argumentos inválidos

Você fez um ótimo trabalho criando erros personalizados, mas para garantir que eles sejam acionados sempre que necessário, é importante validar todos os inputs antes de executar queries. Isso vale para IDs, campos obrigatórios, formatos, etc.

---

## 4. Sobre a estrutura do projeto

Sua estrutura está muito bem organizada e segue o padrão esperado, parabéns! 🎯

```
.
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── db.js
├── routes/
├── controllers/
├── repositories/
└── utils/
```

Essa modularização facilita a manutenção do código e deixa tudo bem claro para qualquer desenvolvedor que venha a trabalhar com você.

---

## Recursos que recomendo para você aprofundar e corrigir esses pontos:

- Para evitar erros com `.trim()` em campos possivelmente `undefined`, veja este vídeo sobre **Validação de Dados e Tratamento de Erros na API**:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para entender melhor como usar o Knex.js e evitar problemas com query builders e migrations:  
  https://knexjs.org/guide/query-builder.html  
  https://knexjs.org/guide/migrations.html

- Para garantir que sua API retorne os status HTTP corretos e trate erros de forma adequada:  
  https://youtu.be/RSZHvQomeKE

- Para entender a arquitetura MVC e manter seu projeto organizado:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

---

## Resumo dos principais pontos para focar:

- 🚨 **Validação segura dos campos do payload:** Sempre verifique se os campos existem antes de usar `.trim()`, para evitar erros inesperados.

- 🗑️ **Confirmação da exclusão de agentes:** Garanta que o agente existe e não possui casos antes de deletar, e trate erros internos com status 500 para falhas inesperadas.

- 🔍 **Aprimorar a busca e filtragem:** Verifique o tratamento do parâmetro `sort`, normalize valores e assegure que os filtros retornem os dados esperados.

- 🛠️ **Mensagens de erro customizadas:** Continue aprimorando as validações para cobrir todos os casos de entradas inválidas.

- ✅ **Manter a estrutura modular:** Você já está no caminho certo com a organização do projeto!

---

Gabriel, seu projeto está muito bem encaminhado! 💪 Com esses ajustes você vai destravar as últimas funcionalidades e deixar sua API ainda mais robusta e profissional. Continue praticando e explorando esses conceitos, você está mandando muito bem! 🚀✨

Se precisar de ajuda para entender algum ponto específico, estou aqui para te ajudar! 😉

Abraços e sucesso! 👊🔥

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>
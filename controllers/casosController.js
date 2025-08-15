const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const errorHandler = require("../utils/errorHandler");

async function listarPorAgente(res, agente_id) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente informado não encontrado no sistema.", "agenteNaoEncontrado", "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgente(agente_id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado com esse id de agente", "casoNaoEncontrado", "Caso não encontrado com esse id de agente"));
    }

    return res.status(200).json(dados);
}

async function listarPorStatus(res, status) {    
    if (status !== "aberto" && status !== "solucionado" ) {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    const dados = await casosRepository.listarCasosPorStatus(status);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado com esse status"));
    }

    return res.status(200).json(dados);
}

async function listarPorAgenteEStatus(res, agente_id, status) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente informado não encontrado no sistema.", "agenteNaoEncontrado", "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgenteEStatus(agente_id, status);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado com esse agente e status"));
    }

    return res.status(200).json(dados);
}

async function getAllCasos(req, res) {
    const { agente_id, status } = req.query;

    if (agente_id && status) {
        return listarPorAgenteEStatus(res, agente_id, status);
    }

    else if (agente_id || agente_id === '') {
        return listarPorAgente(res, agente_id);
    }

    else if (status || status === '') {
        return listarPorStatus(res, status);
    }

    const dados = await casosRepository.findAll();

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Casos não encontrados", "casoNaoEncontrado", "Nenhum caso registrado em nosso sistema."));
    }

    res.status(200).json(dados);
}

async function getCaso(req, res) {
    const { id } = req.params;
    const caso = await casosRepository.findById(id);

    if (!caso) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(caso);
}

async function postCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente informado não encontrado", "agenteNaoEncontrado", "Agente informado não encontrado."));
    }

    const novoCaso = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.adicionarCaso(novoCaso);

    if(!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    }

    res.status(201).json(dados);
}

async function putCaso(req, res) {
    const { id } = req.params;
    const { id: idBody, titulo, descricao, status, agente_id } = req.body;

    if(idBody && idBody !== id) {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O campo 'id' não pode ser alterado."));
    }

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(dados);
}

async function patchCaso(req, res) {
    const { id } = req.params;
    const { id: idBody, titulo, descricao, status, agente_id } = req.body;

    if(idBody && idBody !== id) {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O campo 'id' não pode ser alterado."));
    }

    if (!titulo && !descricao && !status && !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Um Campo Obrigatório", "camposObrigatorios", "Pelo menos um campo deve ser fornecido."));
    }

    if (status && status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (agente_id && !await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    } 

    res.status(200).json(dados);
}

async function deleteCaso(req, res) {
    const { id } = req.params;
    const status = await casosRepository.apagarCaso(id);

    if (!status) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(204).send();
}

async function getAgenteDoCaso(req, res) {
    const { caso_id } = req.params;

    if (!await casosRepository.findById(caso_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso informado não encontrado", "casoNaoEncontrado", "ID do caso informado não encontrado."));
    }

    const dados = await casosRepository.encontrarAgenteDoCaso(caso_id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    res.status(200).json(dados)
}

async function getCasosPorString(req, res) {
    const { q } = req.query;

    if(!q) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro não encontrado", "parametroNaoEncontrado", "Verifique se está utilizando o parametro 'q' e se colocou alguma palavra para buscar."));
    }

    const dados = await casosRepository.encontrarCasoPorString(q);

    if (!dados || dados.length === 0) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Nenhum caso encontrado com a palavra fornecida."));
    }

    res.status(200).json(dados);
}

module.exports = {
   getAllCasos,
   getCaso,
   postCaso,
   putCaso,
   patchCaso,
   deleteCaso,
   getAgenteDoCaso,
   getCasosPorString
}
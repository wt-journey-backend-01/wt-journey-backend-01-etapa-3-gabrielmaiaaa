const db = require("../db/db")

async function encontrarAgentes(){
    try {
        const agentes = await db("agentes").select("*");

        return agentes;
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function encontrarAgenteById(id){
    try {
        const agente = await db("agentes").where({id: id})

        if (!agente || agente.length === 0){
            return false;
        }

        return agente[0];
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function adicionarAgente(dados) {
    try {
        const agente = await db("agentes").insert(dados, ["*"]);

        return agente[0];
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function atualizarAgente(id, agenteAtualizado) {
    try {
        const agente = await db("agentes").where({id: id}).update(agenteAtualizado, ["*"]);

        if (!agente || agente.length === 0) {
            return false;
        }

        return agente[0];
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

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

async function listarAgentesPorCargo(cargo) {
    try {
        const agentes = await db("agentes").select("*").where({cargo:cargo});

        if (!agentes || agentes.length === 0){
            return false;
        }

        return agentes;        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarDataDeIncorporacao(sort) {
    try {
        if (sort === "dataDeIncorporacao") {
            const agentes = await db("agentes").orderBy("dataDeIncorporacao", "asc");

            if (!agentes || agentes.length === 0) {
                return false;
            }

            return agentes;
        }

        const agentes = await db("agentes").orderBy("dataDeIncorporacao", "desc");

        if (!agentes || agentes.length === 0) {
            return false;
        }

        return agentes;
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function listarCasosDeAgentes(id) {
    try {        
        const casos = await db("casos").select("*").where({agente_id:id});

        if (!casos || casos.length === 0) {
            return false;
        }

        return casos;

    } catch (error) {
        console.log(error);
        
        return false;
    }
}

module.exports = {
    encontrarAgentes,
    encontrarAgenteById,
    adicionarAgente,
    atualizarAgente,
    apagarAgente,
    listarAgentesPorCargo,
    listarDataDeIncorporacao,
    listarCasosDeAgentes
}
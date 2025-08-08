const db = require("../db/db")
const agentesRepository = require("../repositories/agentesRepository");


async function findAll() {
    try {
        const casos = await db("casos").select("*");

        return casos;
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function findById(id) {
    try {
        const caso = await db("casos").where({id: id})

        if (!caso){
            return false;
        }

        return caso[0];
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function adicionarCaso(dados) {
    try {
        const caso = await db("casos").insert(dados, ["*"]);

        return caso;
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function atualizarCaso(id, casoAtualizado) {
    try {
        const caso = await db("casos").where({id: id}).update(casoAtualizado, ["*"]);

        if (!caso) {
            return false;
        }

        return caso[0];
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function apagarCaso(id) {
    try {
        const caso = await db("casos").where({id:id}).del();

        if (!caso){
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorAgente(agente_id) {
    try {
        const casos = await db("casos").where({agente_id:agente_id})

        if (!casos){
            return false;
        }

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorStatus(status) {
    try {
        const casos = await db("casos").where({status:status})

        if (!casos){
            return false;
        }

        return casos;
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorAgenteEStatus(agente_id, status) {
    try {
        const casos = await db("casos").where({agente_id:agente_id, status:status});

        if (!casos){
            return false;
        }

        return casos;        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function encontrarAgenteDoCaso(caso_id) {
    try {
        const caso = await db("casos").where({id:caso_id})

        if (!caso){
            return false;
        }

        const agente = await db("agentes").where({id:caso[0].agente_id})

        if (!agente){
            return false;
        }

        return agente[0]
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function encontrarCasoPorString(search) {
    try {
        // where('campo', 'operador', 'valor a ser comparado')
        const casos = await db("casos")
                                                            .whereILike("titulo", `%${search}%`)
                                                            .orWhereILike("descricao", `%${search}%`)

        if (!casos){
            return false;
        }

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

module.exports = {
    findAll,
    findById,
    adicionarCaso,
    atualizarCaso,
    apagarCaso,
    listarCasosPorAgente,
    listarCasosPorStatus,
    encontrarAgenteDoCaso,
    encontrarCasoPorString,
    listarCasosPorAgenteEStatus
};

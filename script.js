var API_URL = "http://159.65.228.63/tarefas";

function getDadosTarefa() {
    var recursos = document.getElementById("recursos").value.split(",");
    var listaRecursos = [];

    for (var i = 0; i < recursos.length; i++) {
        var r = recursos[i].trim();
        if (r !== "") {
            listaRecursos.push(r);
        }
    }

    return {
        prioridade: document.getElementById("prioridade").value,
        descricao: document.getElementById("descricao").value,
        local: document.getElementById("local").value,
        recursosNecessarios: listaRecursos,
        dataLimite: document.getElementById("dataLimite").value,
        matricula: document.getElementById("matricula").value
    };
}

function validarCampos(tarefa) {
    if (
        tarefa.prioridade === "" ||
        tarefa.descricao === "" ||
        tarefa.local === "" ||
        tarefa.dataLimite === "" ||
        tarefa.matricula === ""
    ) {
        alert("Preencha todos os campos!");
        return false;
    }
    return true;
}

async function cadastrarTarefa(event) {
    event.preventDefault();

    var dados = getDadosTarefa();

    if (!validarCampos(dados)) {
        return;
    }

    try {
        var resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            alert("Erro ao salvar a tarefa!");
            return;
        }

        window.location.href = "lista_tarefas.html";

    } catch (e) {
        alert("Erro ao conectar com a API.");
    }
}

async function buscarTarefas() {
    try {
        var resposta = await fetch(API_URL);
        if (!resposta.ok) return [];
        return await resposta.json();
    } catch (e) {
        return [];
    }
}

async function criarTabelaTarefas() {
    var tbody = document.querySelector("#tarefas tbody");
    var tabela = document.getElementById("tabela");
    var mensagem = document.querySelector(".mensagemVazia");

    if (!tbody || !tabela || !mensagem) return;

    var tarefas = await buscarTarefas();
    tbody.innerHTML = "";

    if (!tarefas || tarefas.length === 0) {
        mensagem.style.display = "block";
        tabela.style.display = "none";
        return;
    }

    mensagem.style.display = "none";
 
    tarefas.forEach(function (t) {
        var tr = document.createElement("tr");

        if (typeof t.prioridade === "string" && t.prioridade.toLowerCase() === "urgente") {
            tr.classList.add("urgente");
        }

        var tdPrioridade = document.createElement("td");
        tdPrioridade.textContent = t.prioridade || "";

        var tdDescricao = document.createElement("td");
        tdDescricao.textContent = t.descricao || "";

        var tdLocal = document.createElement("td");
        tdLocal.textContent = t.local || "";

        var tdRecursos = document.createElement("td");
        tdRecursos.textContent = (t.recursosNecessarios || []).join(", ");

        var tdData = document.createElement("td");
        tdData.textContent = t.dataLimite || "";

        var tdMatricula = document.createElement("td");
        tdMatricula.textContent = t.matricula || "";

        tr.appendChild(tdPrioridade);
        tr.appendChild(tdDescricao);
        tr.appendChild(tdLocal);
        tr.appendChild(tdRecursos);
        tr.appendChild(tdData);
        tr.appendChild(tdMatricula);

        tbody.appendChild(tr);
    });
}

window.onload = function () {
    var formCadastro = document.getElementById("formulario");
    if (formCadastro) formCadastro.onsubmit = cadastrarTarefa;
    criarTabelaTarefas();
};

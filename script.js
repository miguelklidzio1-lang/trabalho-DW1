var API_URL = "http://159.65.228.63/tarefas";

// PEGAR DADOS DO FORMULÁRIO
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

// VALIDAR CAMPOS
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

// CADASTRAR NOVA TAREFA
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

// BUSCAR LISTA DE TAREFAS
async function buscarTarefas() {
    try {
        var resposta = await fetch(API_URL);
        if (!resposta.ok) return [];
        return await resposta.json();
    } catch (e) {
        return [];
    }
}

// CRIAR TABELA DE TAREFAS (cria botões com event listeners)
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
    tabela.style.display = "table";

    tarefas.forEach(function (t) {
        var tr = document.createElement("tr");

        // aplica classe urgente se necessário (cuida de maiúsculas/minúsculas)
        if (typeof t.prioridade === "string" && t.prioridade.toLowerCase() === "urgente") {
            tr.classList.add("urgente");
        }

        // células
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

        // AÇÕES
        var tdAcoes = document.createElement("td");

        var editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "edit-btn";
        // guarda id no atributo dataset para evitar problemas com tipos
        editBtn.dataset.id = t.id !== undefined ? t.id : (t._id !== undefined ? t._id : "");
        editBtn.addEventListener("click", function () {
            var id = this.dataset.id;
            if (!id) return alert("ID da tarefa não encontrado.");
            editarTarefa(id);
        });

        var deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Excluir";
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.id = t.id !== undefined ? t.id : (t._id !== undefined ? t._id : "");
        deleteBtn.addEventListener("click", function () {
            var id = this.dataset.id;
            if (!id) return alert("ID da tarefa não encontrado.");
            excluirTarefa(id);
        });

        tdAcoes.appendChild(editBtn);
        tdAcoes.appendChild(deleteBtn);

        // montar linha
        tr.appendChild(tdPrioridade);
        tr.appendChild(tdDescricao);
        tr.appendChild(tdLocal);
        tr.appendChild(tdRecursos);
        tr.appendChild(tdData);
        tr.appendChild(tdMatricula);
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
    });
}

// EXCLUIR TAREFA
async function excluirTarefa(id) {
    if (!confirm("Excluir esta tarefa?")) return;

    try {
        var resposta = await fetch(API_URL + "/" + encodeURIComponent(id), { method: "DELETE" });
        if (!resposta.ok) {
            alert("Erro ao excluir!");
            return;
        }
        // remove linha sem recarregar tudo (melhor experiência)
        criarTabelaTarefas();
    } catch (e) {
        alert("Erro ao conectar com a API.");
    }
}

// EDITAR
function editarTarefa(id) {
    // redireciona para o formulário de edição (seu formulário precisa ler ?id=)
    window.location.href = "cadastro_tarefas.html?id=" + encodeURIComponent(id);
}

// INICIALIZA
window.onload = function () {
    var formCadastro = document.getElementById("formulario");
    if (formCadastro) formCadastro.onsubmit = cadastrarTarefa;
    criarTabelaTarefas();
};

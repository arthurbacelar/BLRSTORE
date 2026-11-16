
const EMAIL_ADMIN = 'admin@loja.com'; // Credencial estática de administrador

const IMG_TENIS_BMW = 'file:///C:/Users/CRC/AppData/Roaming/Code/agentSessionData/9277e50c-5919-4bb6-880c-967ef3d16831/attachments/a1c087cd-333b-4d08-b550-0fad9ed16a7c/Pasted%20Image.png';

const PRODUTO_JAQUETA_DESTAQUE = {
    descricao: 'Jaqueta Bmw Motorsport Mt7 Puma',
    preco: 394.90,
    medida: ['P', 'M', 'G', 'GG'],
    imagem_url: './jaqueta.jpg',
    destaque: true
};

const PRODUTO_TENIS_DESTAQUE = {
    descricao: 'Tênis BMW Motorsport',
    preco: 799.99,
    medida: 'par',
    imagem_url: IMG_TENIS_BMW,
    destaque: true
};

const PRODUTOS_INICIAIS = [
    { ...PRODUTO_JAQUETA_DESTAQUE },
    { ...PRODUTO_TENIS_DESTAQUE },
    {
        descricao: 'Camisa básica',
        preco: 89.90,
        medida: 'unidade',
        imagem_url: './jaqueta.jpg',
        destaque: false
    },
    {
        descricao: 'Calça de moletom',
        preco: 149.90,
        medida: 'unidade',
        imagem_url: './jaqueta.jpg',
        destaque: false
    },
    {
        descricao: 'Tênis esportivo',
        preco: 239.90,
        medida: 'par',
        imagem_url: './jaqueta.jpg',
        destaque: false
    }
];

// ==========================================
// 1. SIMULADOR DE BANCO DE DADOS RELACIONAL
// ==========================================
const MockDB = {
    // Simula: CREATE TABLE IF NOT EXISTS
    obterTabela: (nomeTabela) => {
        return JSON.parse(localStorage.getItem(`db_${nomeTabela}`)) || [];
    },
   
    // Motor interno de persistência
    salvarTabela: (nomeTabela, dados) => {
        localStorage.setItem(`db_${nomeTabela}`, JSON.stringify(dados));
    },

    // Simula: INSERT INTO tabela VALUES (...)
    inserir: (nomeTabela, registro) => {
        const tabela = MockDB.obterTabela(nomeTabela);
        // Gera um ID único simulando UUID do banco
        registro.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        tabela.push(registro);
        MockDB.salvarTabela(nomeTabela, tabela);
        return registro;
    },

    // Simula: SELECT * FROM tabela WHERE filtro
    selecionar: (nomeTabela, filtroCallback = null) => {
        const tabela = MockDB.obterTabela(nomeTabela);
        if (!filtroCallback) return tabela;
        return tabela.filter(filtroCallback);
    }
};

function inicializarProdutosPadrao() {
    const produtos = MockDB.obterTabela('produtos');

    if (produtos.length === 0) {
        PRODUTOS_INICIAIS.forEach(produto => MockDB.inserir('produtos', produto));
        return;
    }

    const jaExisteJaqueta = produtos.some(produto => produto.descricao === PRODUTO_JAQUETA_DESTAQUE.descricao);
    if (!jaExisteJaqueta) {
        MockDB.inserir('produtos', { ...PRODUTO_JAQUETA_DESTAQUE });
    }

    const jaExisteTenis = produtos.some(produto => produto.imagem_url === IMG_TENIS_BMW);
    if (!jaExisteTenis) {
        MockDB.inserir('produtos', { ...PRODUTO_TENIS_DESTAQUE });
    }

    const destaquesAtivos = MockDB.obterTabela('produtos').filter(produto => produto.destaque === true);
    if (destaquesAtivos.length === 0 && produtos.length > 0) {
        const dadosAtualizados = MockDB.obterTabela('produtos');
        dadosAtualizados[0].destaque = true;
        MockDB.salvarTabela('produtos', dadosAtualizados);
    }
}

// ==========================================
// 2. AUTENTICAÇÃO SIMULADA
// ==========================================
function verificarSessao() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const linkLogin = document.getElementById('link-login');
    const linkAdmin = document.getElementById('link-admin');
    const btnSair = document.getElementById('btn-sair');

    if (usuarioLogado) {
        if(linkLogin) linkLogin.style.display = 'none';
        if(btnSair) btnSair.style.display = 'inline-block';
        if (linkAdmin && usuarioLogado.email === EMAIL_ADMIN) {
            linkAdmin.style.display = 'inline-block';
        }
    }
}

function fazerLogout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// ==========================================
// 3. CARRINHO DE COMPRAS
// ==========================================
let carrinho = JSON.parse(localStorage.getItem('carrinhoLoja')) || [];

function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const link = document.getElementById('link-carrinho');
    if(link) link.textContent = `Carrinho (${totalItens})`;
}

function formatarMedida(medida) {
    return Array.isArray(medida) ? medida.join(', ') : medida;
}

function adicionarAoCarrinho(id, descricao, preco, medida, imagem_url) {
    const itemExistente = carrinho.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ id, descricao, preco, medida, imagem_url, quantidade: 1 });
    }
    localStorage.setItem('carrinhoLoja', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    alert('Produto adicionado ao carrinho!');
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarProdutosPadrao();
    verificarSessao();
    atualizarContadorCarrinho();
});
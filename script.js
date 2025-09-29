// Variáveis do Jogo
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');

const gridSize = 20; // Tamanho de cada célula (bloco)
const tileCount = canvas.width / gridSize; // Número de células por linha/coluna

let snake = [];
let direction = { x: 0, y: 0 };
let food = {};
let score = 0;
let gameLoopInterval;
let gameRunning = false;
let inputQueue = []; // Fila para evitar que a cobra se vire 180 graus instantaneamente

// --- Funções de Inicialização e Fim do Jogo ---

function initializeGame() {
    // Posição inicial da cobra (no centro)
    snake = [{ x: 10 * gridSize, y: 10 * gridSize }];
    // Direção inicial: Nenhuma, a cobra só se move após a primeira tecla
    direction = { x: 0, y: 0 }; 
    score = 0;
    gameRunning = true;
    inputQueue = [];
    scoreElement.textContent = score;
    startButton.disabled = true;

    placeFood();
    // Inicia o loop do jogo (atualiza a cada 100ms)
    gameLoopInterval = setInterval(updateGame, 100); 
}

function endGame() {
    clearInterval(gameLoopInterval);
    gameRunning = false;
    startButton.disabled = false;
    alert(`Fim de Jogo! Sua pontuação final foi: ${score}`);
}

// --- Funções da Lógica do Jogo ---

function placeFood() {
    // Gera uma posição aleatória na grade para a comida
    food = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
    };

    // Garante que a comida não apareça dentro da cobra
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood(); // Tenta de novo
        }
    });
}

function updateGame() {
    // 1. Processa a Próxima Direção (da fila)
    if (inputQueue.length > 0) {
        const nextDirection = inputQueue.shift();
        
        // Impede que a cobra dê meia-volta imediatamente (ex: direita -> esquerda)
        if (direction.x === 0 && direction.y === 0) { // Primeira tecla para iniciar o movimento
             direction = nextDirection;
        } else if (direction.x === 0 && nextDirection.x !== 0) { // Vertical -> Horizontal
            direction = nextDirection;
        } else if (direction.y === 0 && nextDirection.y !== 0) { // Horizontal -> Vertical
            direction = nextDirection;
        }
    }
    
    if (direction.x === 0 && direction.y === 0) {
        drawGame(); // Desenha, mas não move se ainda não começou
        return; 
    }

    // 2. Calcula a nova posição da cabeça
    const newHead = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };

    // 3. Checa Colisão com Paredes
    if (newHead.x < 0 || newHead.x >= canvas.width ||
        newHead.y < 0 || newHead.y >= canvas.height) {
        endGame();
        return;
    }

    // 4. Checa Colisão com o Próprio Corpo
    for (let i = 1; i < snake.length; i++) {
        if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
            endGame();
            return;
        }
    }

    // 5. Adiciona a nova cabeça
    snake.unshift(newHead);

    // 6. Checa se Comeu a Comida
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        placeFood(); // Cria nova comida
        // NÃO remove a cauda, permitindo que a cobra cresça
    } else {
        snake.pop(); // Remove a cauda se não comeu a comida
    }

    // 7. Desenha o Jogo
    drawGame();
}

// --- Funções de Desenho ---

function drawGame() {
    // Limpa o Canvas (Necessário em cada frame)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha a Comida
    ctx.fillStyle = '#e74c3c'; // Vermelho
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    // Desenha a Cobra
    snake.forEach((segment, index) => {
        // Cabeça um pouco diferente
        if (index === 0) {
             ctx.fillStyle = '#27ae60'; // Verde mais escuro para a cabeça
        } else {
            ctx.fillStyle = '#2ecc71'; // Verde claro para o corpo
        }
        
        // Desenha o segmento (bloco)
        ctx.fillRect(segment.x, segment.y, gridSize - 1, gridSize - 1); 
        // Subtrair 1px deixa um pequeno espaço preto que imita uma grade
    });
}

// --- Event Listeners (Entrada do Usuário) ---

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Mapeia as teclas de seta (Arrow Keys) para as direções
    const keyMap = {
        'ArrowUp': { x: 0, y: -gridSize },
        'ArrowDown': { x: 0, y: gridSize },
        'ArrowLeft': { x: -gridSize, y: 0 },
        'ArrowRight': { x: gridSize, y: 0 }
    };

    const newDirection = keyMap[e.key];

    if (newDirection) {
        // Envia a nova direção para a fila de input
        inputQueue.push(newDirection);
        e.preventDefault(); // Impede a rolagem da página com as setas
    }
});

startButton.addEventListener('click', initializeGame);

// Desenha o estado inicial do jogo (apenas o tabuleiro e o botão de start)
drawGame();
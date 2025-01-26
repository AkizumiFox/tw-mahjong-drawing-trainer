document.addEventListener('DOMContentLoaded', function() {
    spawnDice();
});

function toggleTile(elem) {
    elem.classList.toggle("clicked");
}

function clearAllTiles() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.remove('clicked');
    });
}

const diceFaces = {
    1: [{ top: '50%', left: '50%' }],
    2: [
        { top: '25%', left: '25%' },
        { top: '75%', left: '75%' }
    ],
    3: [
        { top: '25%', left: '25%' },
        { top: '50%', left: '50%' },
        { top: '75%', left: '75%' }
    ],
    4: [
        { top: '25%', left: '25%' },
        { top: '25%', left: '75%' },
        { top: '75%', left: '25%' },
        { top: '75%', left: '75%' }
    ],
    5: [
        { top: '25%', left: '25%' },
        { top: '25%', left: '75%' },
        { top: '50%', left: '50%' },
        { top: '75%', left: '25%' },
        { top: '75%', left: '75%' }
    ],
    6: [
        { top: '25%', left: '25%' },
        { top: '25%', left: '75%' },
        { top: '50%', left: '25%' },
        { top: '50%', left: '75%' },
        { top: '75%', left: '25%' },
        { top: '75%', left: '75%' }
    ]
};

function getCutPointInfo(diceTotal) {
    const cutPoints = {
        3: { wind: 'W', reserved: 3, start: 4 },
        4: { wind: 'N', reserved: 4, start: 5 },
        5: { wind: 'E', reserved: 5, start: 6 },
        6: { wind: 'S', reserved: 6, start: 7 },
        7: { wind: 'W', reserved: 7, start: 8 },
        8: { wind: 'N', reserved: 8, start: 9 },
        9: { wind: 'E', reserved: 9, start: 10 },
        10: { wind: 'S', reserved: 10, start: 11 },
        11: { wind: 'W', reserved: 11, start: 12 },
        12: { wind: 'N', reserved: 12, start: 13 },
        13: { wind: 'E', reserved: 13, start: 14 },
        14: { wind: 'S', reserved: 14, start: 15 },
        15: { wind: 'W', reserved: 15, start: 16 },
        16: { wind: 'N', reserved: 16, start: 17 },
        17: { wind: 'E', reserved: 17, start: 18 },
        18: { wind: 'S', reserved: 18, start: 19 }
    };
    return cutPoints[diceTotal];
}

let correctTiles = []; // Store the correct tiles for current dice roll

function showFeedback(isCorrect) {
    const overlay = document.getElementById('feedbackOverlay');
    overlay.textContent = isCorrect ? '⭕️' : '❌';
    overlay.classList.add('show');
    
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 1000);
}

function checkAnswer() {
    const clickedTiles = document.querySelectorAll('.tile.clicked');
    
    // Check if exactly 2 tiles are selected
    if (clickedTiles.length !== 2) {
        showFeedback(false);
        return;
    }
    
    // Convert clicked tiles to array of selectors for comparison
    const clickedSelectors = Array.from(clickedTiles).map(tile => {
        const wind = tile.classList[1]; // Get wind class (W, N, E, S)
        const tNum = tile.classList[2]; // Get tile number class (t1, t2, etc)
        return `.tile.${wind}.${tNum}`;
    }).sort();
    
    // Compare with correct tiles
    const isCorrect = clickedSelectors.length === correctTiles.length &&
        clickedSelectors.every((selector, index) => selector === correctTiles[index]);
    
    showFeedback(isCorrect);
    
    if (isCorrect) {
        // Wait for feedback animation before moving to next question
        setTimeout(() => {
            spawnDice();
        }, 1000);
    }
}

function highlightTiles(wind, reserved, start) {
    // Calculate positions without highlighting
    let currentWind = wind;
    let currentPos = start - 1;
    
    const windOrder = ['W', 'N', 'E', 'S'];
    const getNextWind = (current) => {
        const idx = windOrder.indexOf(current);
        return windOrder[(idx + 1) % 4];
    };
    
    const getNextPosition = (pos, wind) => {
        if (pos >= 16) {
            return {
                wind: getNextWind(wind),
                pos: 0
            };
        }
        return {
            wind: wind,
            pos: pos + 1
        };
    };
    
    while (currentPos >= 17) {
        currentWind = getNextWind(currentWind);
        currentPos -= 17;
    }
    
    // Store correct tile selectors
    correctTiles = [];
    
    // First tile selector
    correctTiles.push(`.tile.${currentWind}.t${currentPos + 1}`);
    
    // Second tile selector
    const nextPos = getNextPosition(currentPos, currentWind);
    correctTiles.push(`.tile.${nextPos.wind}.t${nextPos.pos + 1}`);
    
    // Sort to make comparison order-independent
    correctTiles.sort();
}

function debugSetDice() {
    const total = parseInt(document.getElementById('debugDiceTotal').value);
    if (total >= 3 && total <= 18) {
        // For debug, we'll split the total into three dice values
        let values = [];
        let remaining = total;
        
        // First two dice
        for (let i = 0; i < 2; i++) {
            const max = Math.min(6, remaining - (2 - i));
            const value = Math.max(1, Math.min(max, Math.floor(remaining / (3 - i))));
            values.push(value);
            remaining -= value;
        }
        // Last dice
        values.push(remaining);
        
        spawnDice(values);
    }
}

function spawnDice(debugValues = null) {
    // Clear any previous selections
    clearAllTiles();
    
    const diceContainer = document.getElementById('diceContainer');
    diceContainer.innerHTML = '';
    
    let diceTotal = 0;
    const diceValues = [];

    for (let i = 0; i < 3; i++) {
        const value = debugValues ? debugValues[i] : Math.floor(Math.random() * 6) + 1;
        diceValues.push(value);
        diceTotal += value;
        
        const diceDiv = document.createElement('div');
        diceDiv.className = 'dice';

        const pips = diceFaces[value];
        const pipColor = (value === 1 || value === 4) ? 'red' : 'black';

        pips.forEach(pos => {
            const pipDiv = document.createElement('div');
            pipDiv.className = 'pip';
            pipDiv.style.top = pos.top;
            pipDiv.style.left = pos.left;
            pipDiv.style.backgroundColor = pipColor;
            diceDiv.appendChild(pipDiv);
        });

        diceContainer.appendChild(diceDiv);
    }
    
    // Calculate correct tiles but don't highlight them
    const cutInfo = getCutPointInfo(diceTotal);
    if (cutInfo) {
        highlightTiles(cutInfo.wind, cutInfo.reserved, cutInfo.start);
    }
}

function toggleModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.toggle('show');
}

function openTab(tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active");
    }
    const tabLinks = document.getElementsByClassName("tab");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add("active");
}

// Initialize tabs
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            openTab(this.getAttribute('data-tab'));
        });
    });

    // Close modal when clicking outside
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            toggleModal();
        }
    });
});
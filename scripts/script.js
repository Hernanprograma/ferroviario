let timerInterval;
let totalTime = 6 * 60; // 6 minutos en segundos
let examReviewed = false; // Variable para evitar múltiples pulsaciones en el botón de revisión

function startTimer() {
    const timerElement = document.createElement('div');
    timerElement.id = 'timer';
    timerElement.textContent = formatTime(totalTime);
    document.body.appendChild(timerElement);

    timerInterval = setInterval(() => {
        totalTime--;
        timerElement.textContent = formatTime(totalTime);

        if (totalTime <= 30) {
            timerElement.style.backgroundColor = 'red';
        } else {
            timerElement.style.backgroundColor = 'green';
        }

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            setTimerToRevision(timerElement);
            calculateScore();
        }
    }, 1000);
}

function setTimerToRevision(timerElement, score) {
    if (examReviewed) return; // Evitar múltiples pulsaciones
    examReviewed = true; // Marcar como revisado

    // Cambiar el texto de "Revisión de examen" y añadir la nota a la derecha
    timerElement.style.backgroundColor = 'green';
    timerElement.innerHTML = `Revisión de examen <span id="scoreBox" style="background-color: ${score >= 5 ? 'green' : 'red'}; color: white; padding: 5px 10px; border-radius: 5px; margin-left: 10px;">Nota: ${score.toFixed(2)}</span>`;
    timerElement.style.fontSize = '1.2em';

    // Añadir botón para exportar a TXT si no se ha añadido previamente
    if (!document.getElementById('exportTxtButton')) {
        const exportTxtButton = document.createElement('button');
        exportTxtButton.textContent = 'Exportar a TXT';
        exportTxtButton.id = 'exportTxtButton';
        exportTxtButton.onclick = function() {
            exportToTxt();
            exportTxtButton.remove(); // Desaparecer el botón después de la exportación
        };
        timerElement.insertAdjacentElement('afterend', exportTxtButton);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

function shuffleQuestions() {
    const questionsContainer = document.getElementById('questionsContainer');
    const questions = document.querySelectorAll('.question');
    const questionsArray = Array.from(questions);

    const questionContents = questionsArray.map(question => {
        const questionP = question.querySelector('p').textContent;
        const options = Array.from(question.querySelectorAll('.options label')).map(label => {
            const input = label.querySelector('input');
            const fullOptionText = label.textContent.trim();
            const optionText = fullOptionText.substring(fullOptionText.indexOf('. ') + 2);
            return {
                optionText,
                value: input.value,
                checked: input.checked
            };
        });
        const result = question.querySelector('.result').innerHTML;
        return { questionP, options, result };
    });

    questionContents.sort(() => Math.random() - 0.5);

    questionsArray.forEach((question, index) => {
        const questionP = question.querySelector('p');
        questionP.textContent = `${index + 1}. ${questionContents[index].questionP.split('. ')[1]}`;
        const options = question.querySelectorAll('.options label');
        const optionLetters = ['A', 'B', 'C', 'D'];

        questionContents[index].options.forEach((optionContent, i) => {
            const label = options[i];
            const input = label.querySelector('input');
            input.value = optionContent.value;
            input.checked = false;

            label.innerHTML = '';
            label.appendChild(input);
            label.insertAdjacentText('beforeend', `${optionLetters[i]}. ${optionContent.optionText}`);
        });

        const result = question.querySelector('.result');
        result.innerHTML = questionContents[index].result;
        result.style.display = 'none';
    });

    questionsArray.forEach(question => {
        shuffleOptions(question);
    });
}

function shuffleOptions(question) {
    const optionsContainer = question.querySelector('.options');
    const options = Array.from(optionsContainer.children);

    const optionContents = options.map(option => {
        const input = option.querySelector('input');
        const fullOptionText = option.textContent.trim();
        const optionText = fullOptionText.substring(fullOptionText.indexOf('. ') + 2);
        return {
            optionText,
            value: input.value,
            checked: input.checked
        };
    });

    optionContents.sort(() => Math.random() - 0.5);

    const optionLetters = ['A', 'B', 'C', 'D'];
    options.forEach((option, index) => {
        const input = option.querySelector('input');
        input.value = optionContents[index].value;
        input.checked = false;

        option.innerHTML = '';
        option.appendChild(input);
        option.insertAdjacentText('beforeend', `${optionLetters[index]}. ${optionContents[index].optionText}`);
    });
}

function calculateScore() {
    let correct_answers = 0;
    const questions = document.querySelectorAll('.question');
    const total_questions = questions.length;

    questions.forEach((question) => {
        const options = question.querySelectorAll('input[type="radio"]');
        let questionCorrect = false;

        options.forEach(option => {
            if (option.checked) {
                if (option.value === 'correct') {
                    questionCorrect = true;
                    option.parentElement.classList.add('correct');
                } else {
                    option.parentElement.classList.add('incorrect');
                }
            }
            if (option.value === 'correct') {
                option.parentElement.classList.add('correct');
            }
        });

        if (questionCorrect) {
            correct_answers++;
        }

        const resultDiv = question.querySelector('.result');
        resultDiv.style.display = 'block';

        // Añadir checkbox dentro de la sección result con el texto "Marcar para guardar"
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'selectForWord';

        const label = document.createElement('label');
        label.textContent = ' Marcar para guardar';
        label.style.display = 'inline'; // Mantener el texto en línea
        label.prepend(checkbox); // Añadir el checkbox antes del texto

        // Añadir el checkbox dentro del div `.result`
        resultDiv.appendChild(label);
    });

    let score = ((correct_answers - (total_questions - correct_answers) * (1 / 3)) / total_questions) * 10;
    const messageElement = document.getElementById('message');
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        setTimerToRevision(timerElement, score); // Pasar la nota al temporizador
        clearInterval(timerInterval);
    }

    // Mensaje dependiendo del puntaje
    if (score >= 5) {
        messageElement.textContent = '¡Buen trabajo! Sigue así.';
    } else {
        messageElement.textContent = '¡Ánimo! Puedes mejorar.';
    }
}

// Exportar las preguntas marcadas a un archivo TXT
function exportToTxt() {
    const selectedQuestions = document.querySelectorAll('.selectForWord:checked');

    if (selectedQuestions.length === 0) {
        alert('No se ha seleccionado ninguna pregunta.');
        return;
    }

    let docContent = '';
    selectedQuestions.forEach(checkbox => {
        const question = checkbox.closest('.question');
        const questionText = question.querySelector('p').textContent;
        const resultDiv = question.querySelector('.result');
        
        // Eliminar solo el texto del checkbox "Marcar para guardar" y capturar todo lo demás dentro de .result
        const resultClone = resultDiv.cloneNode(true);
        const checkboxAndLabel = resultClone.querySelector('label');
        if (checkboxAndLabel) {
            checkboxAndLabel.remove(); // Eliminar el checkbox y su texto
        }

        // Obtener los párrafos (<p>) dentro de la explicación y añadir cada uno en una nueva línea
        const paragraphs = resultClone.querySelectorAll('p');
        let cleanedResult = '';
        paragraphs.forEach(paragraph => {
            cleanedResult += paragraph.innerText.trim().replace(/\s+/g, ' ') + '\n';
        });

        // Limpiar la pregunta y eliminar espacios innecesarios
        const cleanedQuestion = questionText.trim().replace(/\s+/g, ' ');

        // Añadir solo un salto de línea después de la pregunta y el resultado
        docContent += `Pregunta: ${cleanedQuestion}\nExplicación: ${cleanedResult}\n`;
    });

    // Descargar el archivo TXT sin saltos de línea adicionales ni "Marcar para guardar"
    const blob = new Blob([docContent.trim()], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'preguntas_importantes.txt';
    link.click();
}

document.getElementById('refreshButton').addEventListener('click', function () {
    location.reload();
});

window.onload = function () {
    shuffleQuestions();
    startTimer();
};


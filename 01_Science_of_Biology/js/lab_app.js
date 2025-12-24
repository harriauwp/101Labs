const STATE_KEY = 'uwp_lab1_full_state';

// --- State Management ---
function loadState() {
    const saved = localStorage.getItem(STATE_KEY);
    return saved ? JSON.parse(saved) : { labStart: null, scores: {} };
}

function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getScore(id) {
    const s = loadState();
    return s.scores[id] || { attempts: 0, best: 0, passed: false };
}

function saveScore(id, correct, total) {
    const s = loadState();
    const current = s.scores[id] || { attempts: 0, best: 0, passed: false };
    
    current.attempts++;
    current.best = Math.max(current.best, correct);
    if (correct >= Math.ceil(total * 0.7)) current.passed = true;
    
    s.scores[id] = current;
    saveState(s);
    return current;
}

// --- Quiz Renderer ---
function initQuiz(quizId, questions) {
    const container = document.getElementById('quiz-container');
    const resultDiv = document.getElementById('result-area');
    
    // Check if passed previously
    const stats = getScore(quizId);
    if(stats.passed) {
        resultDiv.innerHTML = `<div class="badge passed" style="font-size:1rem; display:block; text-align:center; padding:1rem;">
            ✅ Mastery Achieved! Best Score: ${stats.best}/${questions.length}
        </div>`;
    }

    // Render Questions
    let html = '';
    questions.forEach((q, i) => {
        html += `<fieldset id="q${i}">
            <legend>Question ${i+1}</legend>
            <p><strong>${q.prompt}</strong></p>`;
        q.choices.forEach((c, j) => {
            html += `<label style="display:block; padding:0.3rem;">
                <input type="radio" name="q${i}" value="${j}"> ${c}
            </label>`;
        });
        html += `<div class="explain" id="explain${i}"></div></fieldset>`;
    });
    
    html += `<button class="btn" id="submitQuiz">Submit Answers</button>`;
    container.innerHTML = html;

    document.getElementById('submitQuiz').addEventListener('click', () => {
        let correct = 0;
        let allAnswered = true;

        questions.forEach((q, i) => {
            const fieldset = document.getElementById(`q${i}`);
            const explain = document.getElementById(`explain${i}`);
            const selected = fieldset.querySelector(`input[name="q${i}"]:checked`);

            if (!selected) {
                allAnswered = false;
                fieldset.classList.add('incorrect');
            } else {
                const val = parseInt(selected.value);
                explain.style.display = 'block';
                if (val === q.answer) {
                    correct++;
                    fieldset.className = 'correct';
                    explain.innerHTML = `<strong>✓ Correct:</strong> ${q.explain}`;
                } else {
                    fieldset.className = 'incorrect';
                    explain.innerHTML = `<strong>✗ Incorrect:</strong> ${q.explain}`;
                }
            }
        });

        if (!allAnswered) {
            alert("Please answer all questions.");
            return;
        }

        const newStats = saveScore(quizId, correct, questions.length);
        const color = newStats.passed ? 'var(--success)' : 'var(--warning)';
        
        resultDiv.innerHTML = `<div style="background:${color}; color:white; padding:1rem; border-radius:4px; text-align:center; margin-top:1rem;">
            Score: ${correct}/${questions.length} <br>
            Attempts: ${newStats.attempts}
        </div>`;
        
        // Scroll to top of results
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
}

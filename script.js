document.addEventListener('DOMContentLoaded', () => {
    const moduleButtons = document.querySelectorAll('.button[id$="-btn"]');
    const mainButtons = document.getElementById('main-buttons');
    const moduleMenus = document.querySelectorAll('.buttons.hidden[id$="-menu"]');
    const backToMainBtns = document.querySelectorAll('.back-button[id^="back-to-main"]');
    const lessonsListContainers = document.querySelectorAll('.lessons-container.hidden[data-module]');
    const backToModuleBtns = document.querySelectorAll('.back-button[id^="back-to-module"]');
    const lessonContent = document.getElementById('lesson-content');
    const lessonDetails = document.getElementById('lesson-details');
    const appHeader = document.getElementById('app-header');

    // --- НОВОЕ: обработчик для кнопки "Назад" в lesson1 (пример) ---
    const backToModule1LessonBtn = document.getElementById('back-to-module1-lessons');
    if (backToModule1LessonBtn) {
        backToModule1LessonBtn.addEventListener('click', () => {
            lessonContent.classList.add('hidden');
            lessonDetails.innerHTML = '';
            appHeader.classList.remove('hidden');
            const module1List = document.getElementById('module1-list');
            if (module1List) {
                module1List.classList.remove('hidden');
            }
        });
    }
    // --- КОНЕЦ НОВОГО ---

    // Функция для создания элементов "Тест"
    function createTestElement(testNumber, modulePath) {
        const testBtn = document.createElement('button');
        testBtn.textContent = `Тест ${testNumber}`;
        testBtn.classList.add('test-button');
        testBtn.dataset.test = `test${testNumber}.html`;
        testBtn.dataset.module = modulePath;

        testBtn.addEventListener('click', () => {
            const testFile = testBtn.dataset.test;
            const modulePathValue = testBtn.dataset.module;
            // Пример для папки "modules/module1": fetch(`modules/${modulePathValue}/${testFile}`)
            fetch(`modules/${modulePathValue}/${testFile}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    loadContent(data, modulePathValue);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке теста:', error);
                    alert('Не удалось загрузить тест. Попробуйте позже.');
                });
        });

        return testBtn;
    }

    // Функция для добавления кнопки "Далее" или "Перейти к тесту"
    function addNextLessonButton(currentLessonNumber, modulePath) {
        const existingNextBtn = lessonDetails.querySelector('.next-lesson-btn');
        if (existingNextBtn) return;
        
        // Создаём кнопку
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('next-lesson-btn', 'submit-btn');
    
        // Проверяем: это 10-й (последний) урок?
        if (currentLessonNumber === 10) {
            // Добавляем кнопку "Перейти к итоговому тесту"
            nextBtn.textContent = 'Перейти к итоговому тесту';
            nextBtn.addEventListener('click', () => {
                // Загружаем finaltest.html из нужной папки:
                fetch(`modules/${modulePath}/finaltest.html`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(data => {
                        loadContent(data, modulePath);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке итогового теста:', error);
                        alert('Не удалось загрузить итоговый тест. Попробуйте позже.');
                    });
            });
        } else {
            // Обычная логика
            const testsPerModule = getTestsPerModule(modulePath);
            if (currentLessonNumber % testsPerModule === 0) {
                // «Перейти к тесту»
                const testNumber = currentLessonNumber / testsPerModule;
                nextBtn.textContent = 'Перейти к тесту';
                nextBtn.addEventListener('click', () => {
                    const testFile = `test${testNumber}.html`;
                    fetch(`modules/${modulePath}/${testFile}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.text();
                        })
                        .then(data => {
                            loadContent(data, modulePath);
                        })
                        .catch(error => {
                            console.error('Ошибка при загрузке теста:', error);
                            alert('Не удалось загрузить тест. Попробуйте позже.');
                        });
                });
            } else {
                // «Далее»
                const nextLessonNumber = currentLessonNumber + 1;
                nextBtn.textContent = 'Далее';
                nextBtn.addEventListener('click', () => {
                    const nextLessonBtn = document.querySelector(
                        `.lessons-container[data-module="${modulePath}"] .lesson-button[data-lesson="lesson${nextLessonNumber}.html"]`
                    );
                    if (nextLessonBtn) {
                        nextLessonBtn.click();
                    } else {
                        alert('Следующий урок не найден. Возможно, это последний урок.');
                    }
                });
            }
        }
    
        // Вставляем кнопку после последнего .section
        const allSections = lessonDetails.querySelectorAll('.section');
        if (allSections.length > 0) {
            const lastSection = allSections[allSections.length - 1];
            lastSection.insertAdjacentElement('afterend', nextBtn);
        } else {
            lessonDetails.appendChild(nextBtn);
        }
    }

    function addNextTestButton(currentTestNumber, modulePath) {
        const nextBtn = document.createElement('button');
        nextBtn.classList.add('next-lesson-btn', 'submit-btn');
        nextBtn.textContent = 'Далее';
    
        // Допустим, после теста N идёт урок (3*N + 1)
        const nextLessonNumber = currentTestNumber * 3 + 1;
    
        nextBtn.addEventListener('click', () => {
            const nextLessonBtn = document.querySelector(
                `.lessons-container[data-module="${modulePath}"] .lesson-button[data-lesson="lesson${nextLessonNumber}.html"]`
            );
            if (nextLessonBtn) {
                nextLessonBtn.click();
            } else {
                alert('Следующий урок не найден. Возможно, это последний урок.');
            }
        });
    
        const allSections = lessonDetails.querySelectorAll('.section');
        if (allSections.length > 0) {
            const lastSection = allSections[allSections.length - 1];
            lastSection.insertAdjacentElement('afterend', nextBtn);
        } else {
            lessonDetails.appendChild(nextBtn);
        }
    }

   // Функция loadContent(...)
    function loadContent(data, modulePath) {
        lessonDetails.innerHTML = data;
        mainButtons.classList.add('hidden');
        moduleMenus.forEach(menu => menu.classList.add('hidden'));
        lessonsListContainers.forEach(container => container.classList.add('hidden'));
        lessonContent.classList.remove('hidden');
        appHeader.classList.add('hidden'); 

        // === Смотрим: это урок или тест? ===
        if (data.includes('Тест') || data.includes('Test')) {
            // Парсим номер теста
            const testNumberRegex = /Тест\s+(\d+)/i; 
            const matchTest = data.match(testNumberRegex);
            if (matchTest && matchTest[1]) {
                const currentTestNumber = parseInt(matchTest[1], 10);
                addNextTestButton(currentTestNumber, modulePath);
            }
            
            // --- Если это "Итоговый тест" (или содержит "finaltest.html"), добавим кнопку "Закончить" ---
            if (data.includes('Итоговый тест') || data.includes('finaltest.html')) {
                addFinishButtonForModule1();
            }
        } else {
            // Это урок, добавляем кнопку "Далее"
            const regex = /Урок\s+(\d+)/i;
            const match = data.match(regex);
            if (match && match[1]) {
                const currentLessonNumber = parseInt(match[1], 10);
                addNextLessonButton(currentLessonNumber, modulePath);

                // **Новая часть: если загружается урок 10, инициализируем Drag & Drop**
                if (currentLessonNumber === 10) {
                    initializeLesson10();
                }
            }
        }
    }

    // Функция добавляет кнопку "Закончить" в конец .quiz (для итогового теста)
    function addFinishButtonForModule1() {
        const quizDiv = lessonDetails.querySelector('.quiz');
        if (!quizDiv) return;

        if (quizDiv.querySelector('.finish-btn')) return;

        const finishBtn = document.createElement('button');
        finishBtn.classList.add('finish-btn');
        finishBtn.textContent = 'Закончить';

        finishBtn.style.marginTop = '20px';
        finishBtn.style.width = '100%';
        finishBtn.style.backgroundColor = '#17a2b8';
        finishBtn.style.color = '#fff';
        finishBtn.style.border = 'none';
        finishBtn.style.borderRadius = '10px';
        finishBtn.style.fontSize = '18px';
        finishBtn.style.padding = '10px';
        finishBtn.style.cursor = 'pointer';
        finishBtn.style.transition = 'background-color 0.3s ease';

        finishBtn.addEventListener('click', () => {
            document.getElementById('lesson-content').classList.add('hidden');
            document.getElementById('lesson-details').innerHTML = '';
            document.getElementById('app-header').classList.remove('hidden');
            document.getElementById('module1-menu').classList.remove('hidden');
        });

        const feedbackDiv = quizDiv.querySelector('.feedback');
        if (feedbackDiv) {
            feedbackDiv.insertAdjacentElement('afterend', finishBtn);
        } else {
            quizDiv.appendChild(finishBtn);
        }
    }

    // Добавление кнопки итогового теста (если нужно)
    function addFinalTest(modulePath) {
        const testBtn = document.createElement('button');
        testBtn.textContent = `Итоговый тест`;
        testBtn.classList.add('test-button');
        testBtn.dataset.test = `finaltest.html`;
        testBtn.dataset.module = modulePath;

        testBtn.addEventListener('click', () => {
            const testFile = testBtn.dataset.test;
            const modulePathValue = testBtn.dataset.module;
            fetch(`modules/${modulePathValue}/${testFile}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    loadContent(data, modulePathValue);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке итогового теста:', error);
                    alert('Не удалось загрузить итоговый тест. Попробуйте позже.');
                });
        });

        lessonDetails.appendChild(testBtn);
    }

    // Общее количество уроков (пример)
    function getTotalLessons(modulePath) {
        const moduleData = {
            'module1': 10,
            'module2': 10,
            'module3': 10
        };
        return moduleData[modulePath] || 0;
    }

    // Сколько уроков между тестами
    function getTestsPerModule(modulePath) {
        const testsPerModuleData = {
            'module1': 3,
            'module2': 3,
            'module3': 3
        };
        return testsPerModuleData[modulePath] || 3;
    }

    // Переход в меню модуля
    moduleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modulePath = button.id.replace('-btn', '');
            mainButtons.classList.add('hidden');
            moduleMenus.forEach(menu => menu.classList.toggle('hidden', menu.id !== `${modulePath}-menu`));
        });
    });

    // Назад к списку модулей
    backToMainBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moduleMenus.forEach(menu => menu.classList.add('hidden'));
            mainButtons.classList.remove('hidden');
        });
    });

    // Переход к списку уроков модуля
    const lessonsButtons = document.querySelectorAll('.lessons-btn');
    lessonsButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modulePath = btn.dataset.module;
            moduleMenus.forEach(menu => menu.classList.add('hidden'));
            lessonsListContainers.forEach(container => {
                container.classList.toggle('hidden', container.dataset.module !== modulePath);
            });
            lessonContent.classList.add('hidden');
            lessonDetails.innerHTML = '';
        });
    });

    // Назад к меню модуля
    backToModuleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleNum = btn.id.replace('back-to-module', '');
            const modulePath = `module${moduleNum}`;
            lessonsListContainers.forEach(container => container.classList.add('hidden'));
            moduleMenus.forEach(menu => {
                if (menu.id === `${modulePath}-menu`) {
                    menu.classList.remove('hidden');
                }
            });
            lessonContent.classList.add('hidden');
            lessonDetails.innerHTML = '';
        });
    });

    // Автоматически создать список уроков + промежуточные тесты
    function populateLessons(modulePath, totalLessons, testsPerModule) {
        const lessonsList = document.querySelector(`.lessons-container[data-module="${modulePath}"]`);
        if (!lessonsList) return;
        const backToModuleBtn = lessonsList.querySelector(`#back-to-module${modulePath.slice(-1)}`);

        for (let i = 1; i <= totalLessons; i++) {
            const lessonBtn = document.createElement('button');
            lessonBtn.textContent = `Урок ${i}`;
            lessonBtn.classList.add('lesson-button');
            lessonBtn.dataset.lesson = `lesson${i}.html`;
            lessonBtn.dataset.module = modulePath;

            lessonBtn.addEventListener('click', () => {
                const lessonFile = lessonBtn.dataset.lesson;
                const modulePathValue = lessonBtn.dataset.module;
                fetch(`modules/${modulePathValue}/${lessonFile}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(data => {
                        loadContent(data, modulePathValue);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке урока:', error);
                        alert('Не удалось загрузить урок. Попробуйте позже.');
                    });
            });

            // Вставляем кнопку урока перед кнопкой "Назад"
            lessonsList.insertBefore(lessonBtn, backToModuleBtn);

            // После каждых testsPerModule уроков — вставляем промежуточный тест (кроме последнего урока)
            if (i % testsPerModule === 0 && i < totalLessons) {
                const testNumber = i / testsPerModule;
                const testElement = createTestElement(testNumber, modulePath);
                lessonsList.insertBefore(testElement, backToModuleBtn);
            }
        }
    }

    // Инициализируем списки уроков (пример на 10 уроков в каждом модуле)
    populateLessons('module1', 10, 3);
    populateLessons('module2', 10, 3);
    populateLessons('module3', 10, 3);

    // Делаем loadContent доступной глобально
    window.loadContent = loadContent;

    /**
     * Функция проверки Теста 1
     */
    window.checkTest = function() {
        const answers = {
            tq1: 'thank you',
            tq2: 'are',
            tq3: 'am',
            tq4: 'good morning',
            tq5: 'bought',
            tq6: 'goes',
            tq7: 'how are you',
            tq8: 'have',
            tq9: 'was',
            tq10: 'sorry, i am late'
        };

        let score = 0;
        const total = Object.keys(answers).length;

        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = answers[key].toLowerCase();

            if (userAnswer === correctAnswer) {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        const feedback = document.getElementById('test-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отлично! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функция проверки Теста 2
     */
    window.checkTest2 = function() {
        const answers = {
            q1: 'hello',
            q2: 'is',
            q3: 'have',
            q4: 'i do not understand',
            q5: 'bought',
            q6: 'goes',
            q7: 'how are you?',
            q8: 'have',
            q9: 'was',
            q10: 'sorry, i am late'
        };

        let score = 0;
        const total = Object.keys(answers).length;

        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            let userAnswer = '';
            if (input.tagName.toLowerCase() === 'select') {
                userAnswer = input.value.trim().toLowerCase();
            } else {
                userAnswer = input.value.trim().toLowerCase();
            }

            const correctAnswer = answers[key].toLowerCase();

            if (userAnswer === correctAnswer) {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        const feedback = document.getElementById('test2-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отлично! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функция проверки Теста 3
     */
    window.checkTest3 = function() {
        const answers = {
            q1: 'had known',
            q2: 'i should have warned you, but i forgot.',
            q3: 'have I seen',
            q4: 'finish',
            q5: 'what i need is some rest.',
            q6: 'were',
            q7: 'would have acted',
            q8: 'if she hadn’t been late, she would be helping us now.',
            q9: 'she must have been very tired.',
            q10: 'attend'
        };

        let score = 0;
        const total = Object.keys(answers).length;

        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            let userAnswer = '';
            if (input.tagName.toLowerCase() === 'select') {
                userAnswer = input.value.trim().toLowerCase();
            } else {
                userAnswer = input.value.trim().toLowerCase();
            }

            let correctAnswer = answers[key].toLowerCase();

            // Для некоторых вопросов можно принимать варианты ответов
            if (key === 'q2') {
                const acceptableAnswers = [
                    'i should have warned you, but i forgot.',
                    'i should have warned you but i forgot.',
                    'i should have warned you but forgot.',
                    'i should have warned you but i forgot'
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer; // Всё в порядке
                } else {
                    correctAnswer = 'incorrect';
                }
            } else if (key === 'q5') {
                const acceptableAnswers = [
                    'what i need is some rest.',
                    'what i need is some rest'
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer;
                } else {
                    correctAnswer = 'incorrect';
                }
            } else if (key === 'q8') {
                const acceptableAnswers = [
                    'if she hadn’t been late, she would be helping us now.',
                    "if she hadn't been late, she would be helping us now."
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer;
                } else {
                    correctAnswer = 'incorrect';
                }
            }

            if (userAnswer === correctAnswer && correctAnswer !== 'incorrect') {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        const feedback = document.getElementById('test3-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отлично! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функция проверки Итогового теста
     */
    window.checkFinalTest = function() {
        const answers = {
            q1: 'if i had studied harder, i would have passed the exam',
            q2: 'i should have warned you, but i forgot.',
            q3: 'have i seen',
            q4: 'finish',
            q5: 'what i need is some rest',
            q6: 'were',
            q7: 'would have acted',
            q8: 'if she hadn’t been late, she would be helping us now',
            q9: 'she must have been very tired',
            q10: 'attend'
        };

        let score = 0;
        const total = Object.keys(answers).length;

        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            let userAnswer = '';
            if (input.tagName.toLowerCase() === 'select') {
                userAnswer = input.value.trim().toLowerCase();
            } else {
                userAnswer = input.value.trim().toLowerCase();
            }

            let correctAnswer = answers[key].toLowerCase();

            // Для некоторых вопросов можно принимать варианты ответов
            if (key === 'q2') {
                const acceptableAnswers = [
                    'i should have warned you, but i forgot.',
                    'i should have warned you but i forgot.',
                    'i should have warned you but forgot.',
                    'i should have warned you but i forgot'
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer; // Всё в порядке
                } else {
                    correctAnswer = 'incorrect';
                }
            } else if (key === 'q5') {
                const acceptableAnswers = [
                    'what i need is some rest',
                    'what i need is some rest.'
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer;
                } else {
                    correctAnswer = 'incorrect';
                }
            } else if (key === 'q8') {
                const acceptableAnswers = [
                    'if she hadn’t been late, she would be helping us now',
                    "if she hadn't been late, she would be helping us now"
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer;
                } else {
                    correctAnswer = 'incorrect';
                }
            } else if (key === 'q9') {
                const acceptableAnswers = [
                    'she must have been very tired',
                    'she must have been very tired.'
                ];
                if (acceptableAnswers.includes(userAnswer)) {
                    correctAnswer = userAnswer;
                } else {
                    correctAnswer = 'incorrect';
                }
            }

            if (userAnswer === correctAnswer && correctAnswer !== 'incorrect') {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        const feedback = document.getElementById('finaltest-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Превосходно! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    // Добавление кнопки "Итоговый тест" для каждого модуля
    const finalTestButtons = document.querySelectorAll('.final-test-btn');
    finalTestButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modulePath = btn.dataset.module;
            fetch(`modules/${modulePath}/finaltest.html`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    loadContent(data, modulePath);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке итогового теста:', error);
                    alert('Не удалось загрузить итоговый тест. Попробуйте позже.');
                });
        });
    });

    // -------------------------------------------------------------
    //  ДОБАВЛЕННЫЙ КОД ДЛЯ РАБОТЫ ЗАДАНИЙ (Quiz + Matching)
    // -------------------------------------------------------------

    /**
     * Глобальная функция: проверка квиза (заполнение пропусков).
     * Вызывается из HTML-урока через onclick="checkQuiz()".
     */
    window.checkQuiz = function() {
        // Ищем заголовок урока
        const lessonHeader = lessonDetails.querySelector('h2');
        if (!lessonHeader) return;
        const lessonTitle = lessonHeader.textContent || '';

        // Объект "правильных ответов" в зависимости от урока
        let answers = {};

        if (lessonTitle.includes('Урок 1')) {
            // Пример ответов для Урока 1
            answers = {
                q1: 'is',
                q2: 'are',
                q3: 'am'
            };
        } else if (lessonTitle.includes('Урок 2')) {
            // Пример ответов для Урока 2
            answers = {
                q1: 'are',
                q2: 'is',
                q3: 'am'
            };
        } else if (lessonTitle.includes('Урок 3')) {
            // Пример ответов для Урока 3
            // (корректируйте под реальные задания)
            answers = {
                q1: 'brushes',
                q2: 'go',
                q3: 'have'
            };
        }

        let score = 0;
        const total = Object.keys(answers).length;

        // Проверяем каждое поле
        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            const userAnswer = input.value.trim().toLowerCase();
            // Если пользовательский ответ совпал с правильным:
            if (userAnswer === answers[key]) {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        // Ищем блок с feedback
        const feedback = document.getElementById('quiz-feedback');
        if (!feedback) return;

        // Выводим результат
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отлично! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };


    /**
     * Глобальная функция: проверка сопоставления (Matching).
     * Вызывается из HTML-урока через onclick="checkMatching()".
     */
    window.checkMatching = function() {
        // Ищем заголовок урока
        const lessonHeader = lessonDetails.querySelector('h2');
        if (!lessonHeader) return;
        const lessonTitle = lessonHeader.textContent || '';

        // Объект правильных сопоставлений
        let matches = {};

        if (lessonTitle.includes('Урок 1')) {
            // Пример сопоставлений для Урока 1
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 2')) {
            // Пример сопоставлений для Урока 2
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 3')) {
            // Пример сопоставлений для Урока 3
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 4')) {
            // Пример сопоставлений для Урока 4
            matches = {
                match1: '3',
                match2: '2',
                match3: '2'
            };
        }

        let score = 0;
        const total = Object.keys(matches).length;

        for (const key in matches) {
            const select = document.getElementById(key);
            if (!select) continue;

            const userValue = select.value;
            if (userValue === matches[key]) {
                score++;
                select.style.borderColor = '#28a745'; // зеленый
            } else {
                select.style.borderColor = '#dc3545'; // красный
            }
        }

        // Ищем блок с результатом
        const feedback = document.getElementById('matching-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все сопоставления правильные.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных сопоставлений: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функции для урока 4
     */

    window.checkQuiz1 = function() {
        const answers = {
            q1: 'am writing',
            q2: 'are cooking',
            q3: 'is swimming'
        };

        let score = 0;
        let total = Object.keys(answers).length;

        for (let key in answers) {
            const userAnswer = document.getElementById(key).value.trim().toLowerCase();
            const correctAnswer = answers[key].toLowerCase();

            if (userAnswer === correctAnswer) {
                score++;
                document.getElementById(key).style.border = '2px solid #28a745'; // Зеленый
            } else {
                document.getElementById(key).style.border = '2px solid #dc3545'; // Красный
            }
        }

        const feedback = document.getElementById('quiz1-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отличная работа! Все ${total} ответов правильные.`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Вы ответили верно на ${score} из ${total}. Попробуйте исправить ошибки.`;
        }
    };

    window.checkMatching4 = function() {
        const matches = {
            match1: '3', // Talk on the phone -> Разговаривать по телефону
            match2: '2', // Watch -> Смотреть
            match3: '2'  // Type -> Печатать
        };

        let score = 0;
        let total = 3;

        for (let key in matches) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === matches[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const feedback = document.getElementById('matching-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Все верно! Отличная работа.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Вы ответили верно на ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функции для урока 5
     */

    window.checkFirstConditional = function() {
        let score = 0;
        let total = 2;

        const userQ1 = document.getElementById('q1').value.trim().toLowerCase().replace(/\./g,'');
        const userQ2 = document.getElementById('q2').value.trim().toLowerCase().replace(/\./g,'');

        // Проверка q1
        if (userQ1.includes('if it rains') && userQ1.includes('i will stay at home')) {
            score++;
            document.getElementById('q1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('q1').style.border = '2px solid #dc3545';
        }

        // Проверка q2
        if (userQ2.includes('if you call me') && userQ2.includes('i will help you')) {
            score++;
            document.getElementById('q2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('q2').style.border = '2px solid #dc3545';
        }

        const fb = document.getElementById('firstcond-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Отлично! Все ${total} примеров First Conditional верны.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Верно: ${score} из ${total}. Проверьте формулировки ещё раз.`;
        }
    };

    window.checkSecondCondMatching = function() {
        const correct = { 's2-1': '1', 's2-2': '1' };
        let score = 0;
        let total = 2;

        for (let key in correct) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === correct[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const fb = document.getElementById('secondcond-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Превосходно! Second Conditional использован правильно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    window.checkErrorCorrection = function() {
        let score = 0;
        let total = 2;

        const e1 = document.getElementById('e1').textContent.trim().toLowerCase();
        const e2 = document.getElementById('e2').textContent.trim().toLowerCase();

        // Правильный вариант (пример): "If I see him, I will say hello."
        if (e1.includes('if i see him') && e1.includes('i will say hello')) {
            score++;
            document.getElementById('e1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e1').style.border = '2px solid #dc3545';
        }

        // Правильный вариант (пример): "If you call me tomorrow, I will help you."
        if (e2.includes('if you call me tomorrow') && e2.includes('i will help you')) {
            score++;
            document.getElementById('e2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e2').style.border = '2px solid #dc3545';
        }

        const fb = document.getElementById('error-feedback');
        fb.style.display = 'block';

        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Отличная работа! Все ошибки исправлены корректно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Исправлено верно: ${score} из ${total}. Проверьте логику условных предложений.`;
        }
    };

    /**
     * Функции для урока 6
     */

    window.checkQuizSecond = function() {
        // Правильные ответы
        // 1) were, would tell
        // 2) had, would travel
        let correct = [
            { id: 's1', answers: ['were', 'would tell'] },
            { id: 's2', answers: ['had', 'would travel'] }
        ];

        let score = 0;

        correct.forEach(item => {
            let user = document.getElementById(item.id).value.toLowerCase().replace(/\./g,'').trim();
            // Удаляем запятые и точки, чтобы максимально дать пользователю шанс
            user = user.replace(/,/g,'');
            // Проверяем каждую часть ответа
            let isCorrect = item.answers.every(ans => user.includes(ans));
            if (isCorrect) {
                score++;
                document.getElementById(item.id).style.border = '2px solid #28a745';
            } else {
                document.getElementById(item.id).style.border = '2px solid #dc3545';
            }
        });

        const feedback = document.getElementById('feedback-second');
        feedback.style.display = 'block';
        if (score === correct.length) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все ответы в задании 1 верны.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${correct.length}. Исправьте неточности.`;
        }
    };

    window.checkQuizThird = function() {
        // Правильные ответы:
        // 1) had left, would have arrived
        // 2) had known, would have helped
        let correct = [
            { id: 't1', answers: ['had left', 'would have arrived'] },
            { id: 't2', answers: ['had known', 'would have helped'] }
        ];

        let score = 0;

        correct.forEach(item => {
            let user = document.getElementById(item.id).value.toLowerCase().replace(/\./g,'').trim();
            user = user.replace(/,/g,'');
            // Проверяем каждую часть ответа
            let isCorrect = item.answers.every(ans => user.includes(ans));
            if (isCorrect) {
                score++;
                document.getElementById(item.id).style.border = '2px solid #28a745';
            } else {
                document.getElementById(item.id).style.border = '2px solid #dc3545';
            }
        });

        const feedback = document.getElementById('feedback-third');
        feedback.style.display = 'block';
        if (score === correct.length) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все ответы в задании 2 верны.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${correct.length}. Попробуйте ещё раз.`;
        }
    };

    window.checkMatching6 = function() {
        // 1) If I won the lottery -> I would buy a new car. (2-й тип)
        // 2) If we had stayed at the hotel -> we wouldn't have slept in the car. (3-й тип)
        const answers = {
            m1: '2', // I would buy a new car. (2-й тип)
            m2: '1'  // we wouldn't have slept in the car. (3-й тип)
        };

        let score = 0;
        let total = 2;

        for (let key in answers) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === answers[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const feedback = document.getElementById('match-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все сопоставления правильные.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Верных сопоставлений: ${score} из ${total}. Исправьте ошибки.`;
        }
    };

    window.checkRadio = function() {
        // 1) If they had called me, I ____ them. -> would have helped (3-й тип)
        // 2) If he ____ more polite, people would like him more. -> were (2-й тип)
        const correct = {
            r1: 'would have helped',
            r2: 'were'
        };
        let score = 0;
        let total = Object.keys(correct).length;

        // r1
        const radios1 = document.getElementsByName('r1');
        let userAnswer1 = '';
        radios1.forEach(radio => {
            if (radio.checked) userAnswer1 = radio.value;
        });
        if (userAnswer1 === correct.r1) score++;

        // r2
        const radios2 = document.getElementsByName('r2');
        let userAnswer2 = '';
        radios2.forEach(radio => {
            if (radio.checked) userAnswer2 = radio.value;
        });
        if (userAnswer2 === correct.r2) score++;

        const feedback = document.getElementById('radio-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Превосходно! Все ответы в задании 4 верны (${score}/${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    window.checkDragAndDrop = function() {
        // Правильная фраза: "if i had studied harder, i would have passed the exam"
        const dropZone = document.getElementById('drop-zone');
        const words = Array.from(dropZone.querySelectorAll('.draggable')).map(el => el.textContent.toLowerCase());
        let userSentence = words.join(' ').replace(/,\s*/g, ', '); // сохраняем запятые

        const correct = "if i had studied harder, i would have passed the exam";
        const feedback = document.getElementById('drag-feedback');
        feedback.style.display = 'block';

        if (userSentence === correct) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Замечательно! Предложение собрано верно.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Не совсем так. Получилось: "${userSentence}". Попробуйте другой порядок.`;
        }
    };

    window.checkRewriting = function() {
        // Примеры правильных ответов:
        // 1) If I had a car, I would drive you to the station.
        // 2) If she had studied enough, she would have passed the test.
        let user1 = document.getElementById('rw1').value.trim().toLowerCase();
        let user2 = document.getElementById('rw2').value.trim().toLowerCase();

        let score = 0;
        let total = 2;

        // Проверяем первое предложение
        if (user1.includes("if i had a car") && (user1.includes("would drive") || user1.includes("would drive you"))) {
            score++;
            document.getElementById('rw1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('rw1').style.border = '2px solid #dc3545';
        }

        // Проверяем второе предложение
        if (user2.includes("if she had studied enough") && (user2.includes("would have passed") || user2.includes("would have passed the test"))) {
            score++;
            document.getElementById('rw2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('rw2').style.border = '2px solid #dc3545';
        }

        const feedback = document.getElementById('rewriting-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Вы показали понимание условных конструкций.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Исправлено верно: ${score} из ${total}. Можете попробовать улучшить формулировки.`;
        }
    };

    // -------------------------------------------------------------
    //  ДОБАВЛЕННЫЙ КОД ДЛЯ РАБОТЫ ЗАДАНИЙ (Quiz + Matching)
    // -------------------------------------------------------------

    /**
     * Глобальная функция: проверка квиза (заполнение пропусков).
     * Вызывается из HTML-урока через onclick="checkQuiz()".
     */
    window.checkQuiz = function() {
        // Ищем заголовок урока
        const lessonHeader = lessonDetails.querySelector('h2');
        if (!lessonHeader) return;
        const lessonTitle = lessonHeader.textContent || '';

        // Объект "правильных ответов" в зависимости от урока
        let answers = {};

        if (lessonTitle.includes('Урок 1')) {
            // Пример ответов для Урока 1
            answers = {
                q1: 'is',
                q2: 'are',
                q3: 'am'
            };
        } else if (lessonTitle.includes('Урок 2')) {
            // Пример ответов для Урока 2
            answers = {
                q1: 'are',
                q2: 'is',
                q3: 'am'
            };
        } else if (lessonTitle.includes('Урок 3')) {
            // Пример ответов для Урока 3
            // (корректируйте под реальные задания)
            answers = {
                q1: 'brushes',
                q2: 'go',
                q3: 'have'
            };
        }

        let score = 0;
        const total = Object.keys(answers).length;

        // Проверяем каждое поле
        for (const key in answers) {
            const input = document.getElementById(key);
            if (!input) continue;

            const userAnswer = input.value.trim().toLowerCase();
            // Если пользовательский ответ совпал с правильным:
            if (userAnswer === answers[key]) {
                score++;
                input.style.borderColor = '#28a745'; // зеленый
            } else {
                input.style.borderColor = '#dc3545'; // красный
            }
        }

        // Ищем блок с feedback
        const feedback = document.getElementById('quiz-feedback');
        if (!feedback) return;

        // Выводим результат
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отлично! Все ответы верны (${score} из ${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };


    /**
     * Глобальная функция: проверка сопоставления (Matching).
     * Вызывается из HTML-урока через onclick="checkMatching()".
     */
    window.checkMatching = function() {
        // Ищем заголовок урока
        const lessonHeader = lessonDetails.querySelector('h2');
        if (!lessonHeader) return;
        const lessonTitle = lessonHeader.textContent || '';

        // Объект правильных сопоставлений
        let matches = {};

        if (lessonTitle.includes('Урок 1')) {
            // Пример сопоставлений для Урока 1
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 2')) {
            // Пример сопоставлений для Урока 2
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 3')) {
            // Пример сопоставлений для Урока 3
            matches = {
                match1: '1',
                match2: '1',
                match3: '1'
            };
        } else if (lessonTitle.includes('Урок 4')) {
            // Пример сопоставлений для Урока 4
            matches = {
                match1: '3',
                match2: '2',
                match3: '2'
            };
        }

        let score = 0;
        const total = Object.keys(matches).length;

        for (const key in matches) {
            const select = document.getElementById(key);
            if (!select) continue;

            const userValue = select.value;
            if (userValue === matches[key]) {
                score++;
                select.style.borderColor = '#28a745'; // зеленый
            } else {
                select.style.borderColor = '#dc3545'; // красный
            }
        }

        // Ищем блок с результатом
        const feedback = document.getElementById('matching-feedback');
        if (!feedback) return;

        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все сопоставления правильные.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных сопоставлений: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };
    
    // Добавление остальных функций для уроков 4, 5 и 6
    /**
     * Функции для урока 4
     */
    window.checkQuiz1 = function() {
        const answers = {
            q1: 'am writing',
            q2: 'are cooking',
            q3: 'is swimming'
        };

        let score = 0;
        let total = Object.keys(answers).length;

        for (let key in answers) {
            const userAnswer = document.getElementById(key).value.trim().toLowerCase();
            const correctAnswer = answers[key].toLowerCase();

            if (userAnswer === correctAnswer) {
                score++;
                document.getElementById(key).style.border = '2px solid #28a745'; // Зеленый
            } else {
                document.getElementById(key).style.border = '2px solid #dc3545'; // Красный
            }
        }

        const feedback = document.getElementById('quiz1-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Отличная работа! Все ${total} ответов правильные.`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Вы ответили верно на ${score} из ${total}. Попробуйте исправить ошибки.`;
        }
    };

    window.checkMatching4 = function() {
        const matches = {
            match1: '3', // Talk on the phone -> Разговаривать по телефону
            match2: '2', // Watch -> Смотреть
            match3: '2'  // Type -> Печатать
        };

        let score = 0;
        let total = 3;

        for (let key in matches) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === matches[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const feedback = document.getElementById('matching-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Все верно! Отличная работа.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Вы ответили верно на ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Функции для урока 5
     */
    window.checkFirstConditional = function() {
        let score = 0;
        let total = 2;

        const userQ1 = document.getElementById('q1').value.trim().toLowerCase().replace(/\./g,'');
        const userQ2 = document.getElementById('q2').value.trim().toLowerCase().replace(/\./g,'');

        // Проверка q1
        if (userQ1.includes('if it rains') && userQ1.includes('i will stay at home')) {
            score++;
            document.getElementById('q1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('q1').style.border = '2px solid #dc3545';
        }

        // Проверка q2
        if (userQ2.includes('if you call me') && userQ2.includes('i will help you')) {
            score++;
            document.getElementById('q2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('q2').style.border = '2px solid #dc3545';
        }

        const fb = document.getElementById('firstcond-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Отлично! Все ${total} примеров First Conditional верны.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Верно: ${score} из ${total}. Проверьте формулировки ещё раз.`;
        }
    };

    window.checkSecondCondMatching = function() {
        const correct = { 's2-1': '1', 's2-2': '1' };
        let score = 0;
        let total = 2;

        for (let key in correct) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === correct[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const fb = document.getElementById('secondcond-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Превосходно! Second Conditional использован правильно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    window.checkErrorCorrection = function() {
        let score = 0;
        let total = 2;

        const e1 = document.getElementById('e1').textContent.trim().toLowerCase();
        const e2 = document.getElementById('e2').textContent.trim().toLowerCase();

        // Правильный вариант (пример): "If I see him, I will say hello."
        if (e1.includes('if i see him') && e1.includes('i will say hello')) {
            score++;
            document.getElementById('e1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e1').style.border = '2px solid #dc3545';
        }

        // Правильный вариант (пример): "If you call me tomorrow, I will help you."
        if (e2.includes('if you call me tomorrow') && e2.includes('i will help you')) {
            score++;
            document.getElementById('e2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e2').style.border = '2px solid #dc3545';
        }

        const fb = document.getElementById('error-feedback');
        fb.style.display = 'block';

        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Отличная работа! Все ошибки исправлены корректно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Исправлено верно: ${score} из ${total}. Проверьте логику условных предложений.`;
        }
    };

    /**
     * Функции для урока 6
     */
    window.checkQuizSecond = function() {
        // Правильные ответы
        // 1) were, would tell
        // 2) had, would travel
        let correct = [
            { id: 's1', answers: ['were', 'would tell'] },
            { id: 's2', answers: ['had', 'would travel'] }
        ];

        let score = 0;

        correct.forEach(item => {
            let user = document.getElementById(item.id).value.toLowerCase().replace(/\./g,'').trim();
            // Удаляем запятые и точки, чтобы максимально дать пользователю шанс
            user = user.replace(/,/g,'');
            // Проверяем каждую часть ответа
            let isCorrect = item.answers.every(ans => user.includes(ans));
            if (isCorrect) {
                score++;
                document.getElementById(item.id).style.border = '2px solid #28a745';
            } else {
                document.getElementById(item.id).style.border = '2px solid #dc3545';
            }
        });

        const feedback = document.getElementById('feedback-second');
        feedback.style.display = 'block';
        if (score === correct.length) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все ответы в задании 1 верны.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${correct.length}. Исправьте неточности.`;
        }
    };

    window.checkQuizThird = function() {
        // Правильные ответы:
        // 1) had left, would have arrived
        // 2) had known, would have helped
        let correct = [
            { id: 't1', answers: ['had left', 'would have arrived'] },
            { id: 't2', answers: ['had known', 'would have helped'] }
        ];

        let score = 0;

        correct.forEach(item => {
            let user = document.getElementById(item.id).value.toLowerCase().replace(/\./g,'').trim();
            user = user.replace(/,/g,'');
            // Проверяем каждую часть ответа
            let isCorrect = item.answers.every(ans => user.includes(ans));
            if (isCorrect) {
                score++;
                document.getElementById(item.id).style.border = '2px solid #28a745';
            } else {
                document.getElementById(item.id).style.border = '2px solid #dc3545';
            }
        });

        const feedback = document.getElementById('feedback-third');
        feedback.style.display = 'block';
        if (score === correct.length) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все ответы в задании 2 верны.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${correct.length}. Попробуйте ещё раз.`;
        }
    };

    window.checkMatching6 = function() {
        // 1) If I won the lottery -> I would buy a new car. (2-й тип)
        // 2) If we had stayed at the hotel -> we wouldn't have slept in the car. (3-й тип)
        const answers = {
            m1: '2', // I would buy a new car. (2-й тип)
            m2: '1'  // we wouldn't have slept in the car. (3-й тип)
        };

        let score = 0;
        let total = 2;

        for (let key in answers) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === answers[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const feedback = document.getElementById('match-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Все сопоставления правильные.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Верных сопоставлений: ${score} из ${total}. Исправьте ошибки.`;
        }
    };

    window.checkRadio = function() {
        // 1) If they had called me, I ____ them. -> would have helped (3-й тип)
        // 2) If he ____ more polite, people would like him more. -> were (2-й тип)
        const correct = {
            r1: 'would have helped',
            r2: 'were'
        };
        let score = 0;
        let total = Object.keys(correct).length;

        // r1
        const radios1 = document.getElementsByName('r1');
        let userAnswer1 = '';
        radios1.forEach(radio => {
            if (radio.checked) userAnswer1 = radio.value;
        });
        if (userAnswer1 === correct.r1) score++;

        // r2
        const radios2 = document.getElementsByName('r2');
        let userAnswer2 = '';
        radios2.forEach(radio => {
            if (radio.checked) userAnswer2 = radio.value;
        });
        if (userAnswer2 === correct.r2) score++;

        const feedback = document.getElementById('radio-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = `Превосходно! Все ответы в задании 4 верны (${score}/${total}).`;
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    window.checkDragAndDrop = function() {
        // Правильная фраза: "if i had studied harder, i would have passed the exam"
        const dropZone = document.getElementById('drop-zone');
        const words = Array.from(dropZone.querySelectorAll('.draggable')).map(el => el.textContent.toLowerCase());
        let userSentence = words.join(' ').replace(/,\s*/g, ', '); // сохраняем запятые

        const correct = "if i had studied harder, i would have passed the exam";
        const feedback = document.getElementById('drag-feedback');
        feedback.style.display = 'block';

        if (userSentence === correct) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Замечательно! Предложение собрано верно.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Не совсем так. Получилось: "${userSentence}". Попробуйте другой порядок.`;
        }
    };

    window.checkRewriting = function() {
        // Примеры правильных ответов:
        // 1) If I had a car, I would drive you to the station.
        // 2) If she had studied enough, she would have passed the test.
        let user1 = document.getElementById('rw1').value.trim().toLowerCase();
        let user2 = document.getElementById('rw2').value.trim().toLowerCase();

        let score = 0;
        let total = 2;

        // Проверяем первое предложение
        if (user1.includes("if i had a car") && (user1.includes("would drive") || user1.includes("would drive you"))) {
            score++;
            document.getElementById('rw1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('rw1').style.border = '2px solid #dc3545';
        }

        // Проверяем второе предложение
        if (user2.includes("if she had studied enough") && (user2.includes("would have passed") || user2.includes("would have passed the test"))) {
            score++;
            document.getElementById('rw2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('rw2').style.border = '2px solid #dc3545';
        }

        const feedback = document.getElementById('rewriting-feedback');
        feedback.style.display = 'block';
        if (score === total) {
            feedback.className = 'feedback success';
            feedback.textContent = 'Отлично! Вы показали понимание условных конструкций.';
        } else {
            feedback.className = 'feedback error';
            feedback.textContent = `Исправлено верно: ${score} из ${total}. Можете попробовать улучшить формулировки.`;
        }
    };

    /**
     * Функция для обработки кнопки "Назад"
     * Если вы хотите добавить универсальную обработку кнопок "Назад",
     * можно использовать делегирование событий или добавить отдельные обработчики.
     */

    // -------------------------------------------------------------
    //  ДОБАВЛЕННЫЙ КОД ЗАКАНЧИВАЕТСЯ ЗДЕСЬ
    // -------------------------------------------------------------

    // -------------------------------------------------------------
    //  ДОБАВЛЕННЫЙ КОД ДЛЯ РАБОТЫ ЗАДАНИЙ УРОКА 10
    // -------------------------------------------------------------

    /************************************************************
     * Урок 10: Advanced Grammar — Inversion, Subjunctive, Emphatic Structures
     ************************************************************/

    /**
     * Задание 1: Subjunctive / Inversion
     */
    window.checkSubjunctiveInversion = function() {
        const correct = {
            q1: 'be',
            q2: 'have i seen',
            q3: 'were'
        };
        let score = 0;
        let total = 3;

        for (let key in correct) {
            let val = document.getElementById(key).value.trim().toLowerCase();
            // Удаляем точки
            val = val.replace(/\./g,'');
            if (val === correct[key]) {
                score++;
                document.getElementById(key).style.border = '2px solid #28a745';
            } else {
                document.getElementById(key).style.border = '2px solid #dc3545';
            }
        }

        const fb = document.getElementById('subj-inv-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Отлично! Сослагательное наклонение и инверсия применены верно.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Вы ответили верно на ${score} из ${total}. Проверьте ответы.`;
        }
    };

    /**
     * Задание 2: Сопоставьте инверсию
     */
    window.checkInversionMatch = function() {
        // inv1 -> "We rarely meet" (1)
        // inv2 -> "He knew little about the truth" (2)
        const correct = { inv1: '1', inv2: '2' };
        let score = 0;
        let total = 2;

        for (let key in correct) {
            const val = document.getElementById(key).value;
            if (val === correct[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const fb = document.getElementById('inversion-match-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Все сопоставления верны (${score}/${total}). Отличная работа.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Верно: ${score} из ${total}. Исправьте ошибки.`;
        }
    };

    /**
     * Задание 3: Radio Quiz (Cleft types)
     */
    window.checkCleftRadio = function() {
        const correct = { r1: 'It-cleft', r2: 'What-cleft' };
        let score = 0;
        let total = 2;

        // r1
        let user1 = '';
        document.getElementsByName('r1').forEach(radio => {
            if (radio.checked) user1 = radio.value;
        });
        if (user1 === correct.r1) score++;

        // r2
        let user2 = '';
        document.getElementsByName('r2').forEach(radio => {
            if (radio.checked) user2 = radio.value;
        });
        if (user2 === correct.r2) score++;

        const fb = document.getElementById('cleft-radio-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Замечательно! Оба ответа (${score}/${total}) верны.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте снова.`;
        }
    };

    /**
     * Задание 4: Drag & Drop (Inversion)
     */
    window.checkInversionDrag = function() {
        // "Hardly had we started when the lights went out."
        const dropZone = document.getElementById('drop-zone');
        const words = Array.from(dropZone.querySelectorAll('.draggable')).map(w => w.textContent.toLowerCase());
        const userSentence = words.join(' ').trim();
        const correctSentence = "hardly had we started when the lights went out.";

        const fb = document.getElementById('inversion-drag-feedback');
        fb.style.display = 'block';

        if (userSentence === correctSentence) {
            fb.className = 'feedback success';
            fb.textContent = 'Отлично! Инверсия в предложении оформлена корректно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Получилось: "${userSentence}". Попробуйте другой порядок.`;
        }
    };

    /**
     * Задание 5: Исправьте ошибки (Subjunctive, Inversion)
     */
    window.checkSubjInversionErrors = function() {
        // 1) It is crucial that he leave at 7 AM.
        // 2) Never have I seen such dedication.
        // 3) If I were you, I'd apply for the position.
        let e1Val = document.getElementById('e1').textContent.trim().toLowerCase();
        let e2Val = document.getElementById('e2').textContent.trim().toLowerCase();
        let e3Val = document.getElementById('e3').textContent.trim().toLowerCase();

        let score = 0;
        let total = 3;

        // Проверка 1
        if (e1Val.includes("it is crucial that he leave")) {
            score++;
            document.getElementById('e1').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e1').style.border = '2px solid #dc3545';
        }

        // Проверка 2
        if (e2Val.includes("never have i seen")) {
            score++;
            document.getElementById('e2').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e2').style.border = '2px solid #dc3545';
        }

        // Проверка 3
        if (e3Val.includes("if i were you")) {
            score++;
            document.getElementById('e3').style.border = '2px solid #28a745';
        } else {
            document.getElementById('e3').style.border = '2px solid #dc3545';
        }

        const fb = document.getElementById('subj-inv-error-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Отлично! Все ошибки исправлены правильно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Вы исправили верно: ${score} из ${total}. Проверьте ещё раз.`;
        }
    };

    /**
     * Задание 6: Сопоставьте термин с переводом
     */
    window.checkTermMatching = function() {
        // term1: "Subjunctive Mood" -> "Сослагательное наклонение" (1)
        // term2: "Inversion" -> "Инверсия (перестановка слов)" (1)
        const answers = { term1: '1', term2: '1' };
        let score = 0;
        let total = 2;

        for (let key in answers) {
            const userChoice = document.getElementById(key).value;
            if (userChoice === answers[key]) {
                score++;
                document.getElementById(key).style.borderColor = '#28a745';
            } else {
                document.getElementById(key).style.borderColor = '#dc3545';
            }
        }

        const fb = document.getElementById('term-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = 'Замечательно! Вы верно сопоставили термины.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Верных сопоставлений: ${score} из ${total}. Попробуйте ещё раз.`;
        }
    };

    /**
     * Задание 7: Radio Quiz (Mixing Emphatic & Subjunctive)
     */
    window.checkMixRadio = function() {
        // r3 -> 'be'
        // r4 -> 'that'
        const correct = { r3: 'be', r4: 'that' };
        let total = 2;
        let score = 0;

        let user3 = '';
        document.getElementsByName('r3').forEach(radio => {
            if (radio.checked) user3 = radio.value;
        });
        if (user3 === correct.r3) score++;

        let user4 = '';
        document.getElementsByName('r4').forEach(radio => {
            if (radio.checked) user4 = radio.value;
        });
        if (user4 === correct.r4) score++;

        const fb = document.getElementById('mix-radio-feedback');
        fb.style.display = 'block';
        if (score === total) {
            fb.className = 'feedback success';
            fb.textContent = `Превосходно! Все ответы (${score}/${total}) верны.`;
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Правильных ответов: ${score} из ${total}. Попробуйте снова.`;
        }
    };

    /**
     * Задание 8: Drag & Drop (Emphatic "What" cleft)
     */
    window.checkWhatDrag = function() {
        // "What he really wants is a chance to prove himself."
        const dropZone = document.getElementById('drop-zone2');
        const words = Array.from(dropZone.querySelectorAll('.draggable')).map(w => w.textContent.toLowerCase());
        const userSentence = words.join(' ').trim();
        const correctSentence = "what he really wants is a chance to prove himself.";

        const fb = document.getElementById('what-drag-feedback');
        fb.style.display = 'block';

        if (userSentence === correctSentence) {
            fb.className = 'feedback success';
            fb.textContent = 'Отлично! Cleft-предложение собрано правильно.';
        } else {
            fb.className = 'feedback error';
            fb.textContent = `Получилось: "${userSentence}". Попробуйте другой порядок.`;
        }
    };

    /**
     * Инициализация Drag & Drop для урока 10
     */
    function initializeLesson10() {
        //---------------------------------
        // ЗАДАНИЕ 4 (Inversion)
        //---------------------------------
        // 2 контейнера: начальный (container10a) и dropZone1 (drop-zone)
        const container4 = document.getElementById('container10a');
        const dropZone4 = document.getElementById('drop-zone');
        const dragItems1 = document.querySelectorAll('.draggable1');
    
        // Обработка всех слов draggable1
        dragItems1.forEach(item => {
            // DRAGSTART: запоминаем, откуда пользователь берет элемент
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.dataTransfer.effectAllowed = 'move';
                // Ставим флажок dropped=false (не упал)
                item.dataset.dropped = 'false';
                // Запоминаем id текущего родителя
                item.dataset.originParent = item.parentElement.id;
                item.style.opacity = '0.4';
            });
    
            // DRAGEND: если dropped=false, вернём слово обратно
            item.addEventListener('dragend', e => {
                item.style.opacity = '1';
                if (item.dataset.dropped === 'false') {
                    // Ищем родительский контейнер
                    const origin = document.getElementById(item.dataset.originParent);
                    origin.appendChild(item);
                }
            });
        });
    
        // Сделаем и container4, и dropZone4 «droppable»
    
        // container4 (начальный) как зона сброса
        container4.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            container4.classList.add('dragover');
        });
        container4.addEventListener('dragleave', e => {
            container4.classList.remove('dragover');
        });
        container4.addEventListener('drop', e => {
            e.preventDefault();
            container4.classList.remove('dragover');
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            dragged.dataset.dropped = 'true';  // упал успешно
            container4.appendChild(dragged);
        });
    
        // dropZone4 (целевой)
        dropZone4.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dropZone4.classList.add('dragover');
        });
        dropZone4.addEventListener('dragleave', e => {
            dropZone4.classList.remove('dragover');
        });
        dropZone4.addEventListener('drop', e => {
            e.preventDefault();
            dropZone4.classList.remove('dragover');
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            dragged.dataset.dropped = 'true'; // упал успешно
            dropZone4.appendChild(dragged);
        });
    
    
        //---------------------------------
        // ЗАДАНИЕ 8 (What-cleft)
        //---------------------------------
        // 2 контейнера: начальный (container10b) и dropZone2
        const container8 = document.getElementById('container10b');
        const dropZone8 = document.getElementById('drop-zone2');
        const dragItems2 = document.querySelectorAll('.draggable2');
    
        dragItems2.forEach(item => {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.dataTransfer.effectAllowed = 'move';
                item.dataset.dropped = 'false';
                item.dataset.originParent = item.parentElement.id;
                item.style.opacity = '0.4';
            });
    
            item.addEventListener('dragend', e => {
                item.style.opacity = '1';
                if (item.dataset.dropped === 'false') {
                    const origin = document.getElementById(item.dataset.originParent);
                    origin.appendChild(item);
                }
            });
        });
    
        // container8 как зона сброса
        container8.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            container8.classList.add('dragover');
        });
        container8.addEventListener('dragleave', e => {
            container8.classList.remove('dragover');
        });
        container8.addEventListener('drop', e => {
            e.preventDefault();
            container8.classList.remove('dragover');
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            dragged.dataset.dropped = 'true';
            container8.appendChild(dragged);
        });
    
        // dropZone8 (целевой) 
        dropZone8.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            dropZone8.classList.add('dragover');
        });
        dropZone8.addEventListener('dragleave', e => {
            dropZone8.classList.remove('dragover');
        });
        dropZone8.addEventListener('drop', e => {
            e.preventDefault();
            dropZone8.classList.remove('dragover');
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            dragged.dataset.dropped = 'true';
            dropZone8.appendChild(dragged);
        });
    }
    
});
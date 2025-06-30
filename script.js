// Конфигурация
const config = {
    indicators: ['Выпуск', 'Брак', 'Простой']
};

// Данные приложения
let appData = {
    rawData: [],
    workshops: []
};

// Инициализация
function initApp() {
    setupFileUpload();
    console.log("Приложение инициализировано");
}

// Загрузка CSV
function setupFileUpload() {
    const fileInput = document.getElementById('csvUpload');
    const fileNameDisplay = document.getElementById('fileName');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileNameDisplay.textContent = `Файл: ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const csvData = parseCSV(e.target.result);
                if (csvData.length > 0) {
                    appData.rawData = csvData;
                    processData(csvData);
                    showNotification("Данные успешно загружены", "success");
                }
            } catch (error) {
                showNotification(`Ошибка: ${error.message}`, "error");
            }
        };
        reader.readAsText(file);
    });
}

// Парсинг CSV
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) throw new Error("CSV файл пуст");
    
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i] ? values[i].trim() : '';
            return obj;
        }, {});
    });
}

// Обработка данных
function processData(data) {
    // Получаем список цехов
    appData.workshops = [...new Set(data.map(row => row['Цех']))].sort();
    
    // Создаем графики
    renderCharts();
}

// Отрисовка графиков
function renderCharts() {
    const container = document.getElementById('workshopCharts');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Для каждого показателя создаем график
    config.indicators.forEach(indicator => {
        const canvas = document.createElement('canvas');
        canvas.height = 300;
        container.appendChild(canvas);
        
        // Подготовка данных
        const chartData = {
            labels: appData.workshops,
            datasets: [{
                label: indicator,
                data: appData.workshops.map(workshop => {
                    const workshopData = appData.rawData.filter(row => row['Цех'] === workshop);
                    return workshopData.reduce((sum, row) => sum + (parseFloat(row[indicator]) || 0), 0);
                }),
                backgroundColor: '#3366cc'
            }]
        };
        
        // Создаем график
        new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: indicator
                    }
                }
            }
        });
    });
}

// Уведомления
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);

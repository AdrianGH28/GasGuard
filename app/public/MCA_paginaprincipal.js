window.onload = function() {
    
    // Primero define el gauge
    const ctxGauge = document.getElementById('myChart').getContext('2d');
    const gradientSegment = ctxGauge.createLinearGradient(0, 0, 700, 0);
    gradientSegment.addColorStop(0, 'red');
    gradientSegment.addColorStop(1, 'red');

    const dataGauge = {
        labels: ['Score', 'Gray Area'],
        datasets: [{
            label: 'Weekly Sales',
            data: [0, 4000],
            backgroundColor: [gradientSegment, 'rgba(211, 211, 211, 0.2)'],
            borderColor: ['rgba(211, 211, 211, 0.2)'],
            borderWidth: 0,
            cutout: '90%',
            circumference: 180,
            rotation: 270,
        }]
    };

    const gaugeChartText = {
        id: 'gaugeChartText',
        afterDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, data, chartArea: { top, bottom, left, right, width, height } } = chart;
            ctx.save();
            const xCoor = chart.getDatasetMeta(0).data[0].x;
            const yCoor = chart.getDatasetMeta(0).data[0].y;
            const score = data.datasets[0].data[0];
            let rating = score < 1000 ? 'OK' : score < 1500 ? 'Cuidado' : 'PELIGRO';

            ctx.font = `30px sans-serif`;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(score, xCoor, yCoor);
            ctx.fillText(rating, xCoor, yCoor - 120);
            ctx.restore();
        }
    };

    const configGauge = {
        type: 'doughnut',
        data: dataGauge,
        options: {
            aspectRatio: 1.5,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [gaugeChartText]
    };

    const myGaugeChart = new Chart(ctxGauge, configGauge);
    
    
    
    
    window.getSensorValue = function(callback) {
  fetch('/api/sensor-value')
    .then(response => response.json())
    .then(data => {
      let sensorValue = data.resistencia;
      console.log('Sensor value:', sensorValue);

      if (sensorValue !== null) {
        callback(sensorValue);
      }
    })
    .catch(error => {
      console.error('Error fetching sensor data:', error);
    });
}
    
    // Llama a la función para obtener el valor del sensor y actualizar la página inicialmente
    getAndDisplaySensorValue();

    // Configura un temporizador para actualizar periódicamente el valor del sensor y la gráfica
    setInterval(getAndDisplaySensorValue, 5000); // Actualiza cada 5 segundos (5000 milisegundos)

    // Función para obtener y mostrar el valor del sensor
    function getAndDisplaySensorValue() {
        getSensorValue((sensorValue) => {
            const now = new Date();
            const dateString = now.toISOString().split('T')[0];
            const timeString = now.toTimeString().split(' ')[0];

            document.getElementById('sensorValue').textContent = "Valor del sensor: " + sensorValue;
            addData(sensorValue); // Añade el valor del sensor al gráfico de línea
            updateGauge(sensorValue); // Actualiza el medidor con el nuevo valor del sensor

            if (sensorValue !== null) {
                hideLoadingModal();
                if (sensorValue > 1500) {
                    showModal(sensorValue, dateString, timeString);
                }

                // Enviar datos al servidor
                sendDataToServer(sensorValue, dateString, timeString);
            } else {
                showLoadingModal();
            }
        });
    }

    function updateGauge(sensorValue) {
        const gaugePercentage = (sensorValue / 4000) * 100;

        // Actualiza el primer valor del array 'data' en el objeto 'dataGauge' con 'sensorValue'
        dataGauge.datasets[0].data[0] = sensorValue;
        // Actualiza el segundo valor del array 'data' en el objeto 'dataGauge' con la diferencia entre 4000 y 'sensorValue'
        dataGauge.datasets[0].data[1] = 4000 - sensorValue;
    
        // Actualiza la configuración del medidor para reflejar el porcentaje calculado
        configGauge.options.rotation = -gaugePercentage * 1.8; // 180 grados = 100%, por lo tanto, 1.8 grados por cada 1%
    
        // Actualiza el gráfico de medidor
        myGaugeChart.update();
    }



    
    // Función para mostrar el valor del sensor en el medidor
    function showLoadingModal() {
        document.getElementById("loadingModal").style.display = "block";
    }

    function hideLoadingModal() {
        document.getElementById("loadingModal").style.display = "none";
    }

    function showModal(sensorValue, date, time) {
        var modal = document.getElementById("myModal");
        var modalValue = document.getElementById("modalValue");
        var modalDate = document.getElementById("modalDate");
        var modalTime = document.getElementById("modalTime");

        modalValue.textContent = "Valor del sensor: " + sensorValue;
        modalDate.textContent = "Fecha: " + date;
        modalTime.textContent = "Hora: " + time;

        modal.style.display = "block";
        const closeModalBtn = document.querySelectorAll('.closeModalBtn');
        closeModalBtn.forEach(btn => btn.addEventListener('click', function() {
            modal.style.display = 'none';
        }));

        var sensorValueElement = document.getElementById("sensorValue");
        sensorValueElement.textContent = "Valor del sensor: " + sensorValue;
    }

    function sendDataToServer(sensorValue, date, time) {
        console.log('Sending data to server:', { valor: sensorValue, fecha: date, hora: time });
    
        fetch('/guardar-datos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                valor: sensorValue,
                fecha: date,
                hora: time,
                id_dispositivo: 1, // Supongo que el id_dispositivo es fijo en 1 según tu código
                id_presenciadegas: sensorValue > 1500 ? 2 : 1 // Determina el id_presenciadegas según el valor del sensor
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Error from server:', text);
                    throw new Error(text || 'Error al enviar los datos al servidor');
                });
            }
            console.log('Datos enviados correctamente al servidor');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Gráfico 1: Línea
    const ctxLine = document.getElementById('myLineChart').getContext('2d');
    const dataLine = {
        labels: [],
        datasets: [{
            label: 'ppm',
            data: [],
            backgroundColor: 'rgba(237, 19, 26, 1)',
            borderColor: 'rgba(237, 19, 26, 1)',
            borderWidth: 1
        }]
    };

    const originalDataLine = {
        labels: [],
        datasets: [{
            label: 'ppm',
            data: []
        }]
    };

    const configLine = {
        type: 'line',
        data: dataLine,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const myLineChart = new Chart(ctxLine, configLine);

    function addData(sensorValue) {
        const now = new Date();
        const timeString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        originalDataLine.labels.push(now);
        originalDataLine.datasets[0].data.push(sensorValue);

        if (originalDataLine.labels.length > 10) {
            originalDataLine.labels.shift();
            originalDataLine.datasets[0].data.shift();
        }

        updateChart();
    }

    function updateChart() {
        dataLine.labels = originalDataLine.labels.map(label => label.getHours() + ':' + label.getMinutes() + ':' + label.getSeconds());
        dataLine.datasets[0].data = [...originalDataLine.datasets[0].data];
        myLineChart.update();
    }
    
    // Instantly assign Chart.js version
    const chartVersion = document.getElementById('chartVersion');
    chartVersion.innerText = Chart.version;
};




/*
window.onload = function() {
    showLoadingModal();
    window.feed = function(callback) {
        var ticks = [];

        // Generar 10 valores random entre 10 y 50
        for (let i = 0; i < 10; i++) {
            ticks.push(Math.floor(Math.random() * 40) + 10);
        }

        // Generar un valor random entre 60 y 70
        ticks.push(Math.floor(Math.random() * 10) + 60);

        // Generar un valor random entre 71 y 100
        ticks.push(Math.floor(Math.random() * 30) + 71);

        // Seleccionar un valor al azar de la lista generada
        var randomIndex = Math.floor(Math.random() * ticks.length);
        var randomValue = ticks[randomIndex];

        var currentDate = new Date();
        var date = currentDate.toISOString().split('T')[0];
        var time = currentDate.toTimeString().split(' ')[0];

        if (randomValue !== null) {
            hideLoadingModal();

            if (randomValue > 50) {
                showModal(randomValue, date, time);
            }

            // Devolver el valor random seleccionado, la fecha y la hora como una cadena JSON
            callback(JSON.stringify({ plot0: randomValue, date: date, time: time }));
            addData(randomValue);

            // Enviar datos al servidor
            sendDataToServer(randomValue, date, time);
        } else {
            showLoadingModal();
        };
    };

    // Función para mostrar el modal de carga
    function showLoadingModal() {
        loadingModal.style.display = "block";
    }

    // Función para ocultar el modal de carga
    function hideLoadingModal() {
        loadingModal.style.display = "none";
    }

    // Función para mostrar el modal 

    function showModal(randomValue, date, time) {
        var modal = document.getElementById("myModal");
        var modalValue = document.getElementById("modalValue");
        var modalDate = document.getElementById("modalDate");
        var modalTime = document.getElementById("modalTime");

        modalValue.textContent = "Valor generado: " + randomValue;
        modalDate.textContent = "Fecha: " + date;
        modalTime.textContent = "Hora: " + time;

        modal.style.display = "block";
        const closeModalBtn = document.querySelector('.closeModalBtn');
        closeModalBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    };


    function sendDataToServer(randomValue, date, time) {
        console.log('Sending data to server:', { plot0: randomValue, date: date, time: time });
    
        fetch('/guardar-datos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plot0: randomValue,
                    date: date,
                    time: time
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Error from server:', text);
                        throw new Error(text || 'Error al enviar los datos al servidor');
                    });
                }
                console.log('Datos enviados correctamente al servidor');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    



    var myConfig = {
        type: "gauge",
        backgroundColor: 'none',
        globals: {
            fontSize: 25
            // color: "white"
        },
        plotarea: {
            marginTop: 80
        },
        plot: {
            size: '100%',
            valueBox: {
                placement: 'center',
                text: '%v', //default
                fontSize: 35,
                rules: [{
                        rule: '%v >= 70',
                        text: '%v<br>PELIGRO'
                    },
                    {
                        rule: '%v < 70 && %v > 50',
                        text: '%v<br>CUIDADO'
                    },
                    {
                        rule: '%v < 50 && %v >= 10',
                        text: '%v<br>OK'
                    },
                    {
                        rule: '%v =100',
                        text: '%v<br>PELIGRO'
                    },
                ]
            }
        },
        tooltip: {
            borderRadius: 5
        },
        scaleR: {
            aperture: 180,
            minValue: 0,
            maxValue: 100,
            step: 10,
            center: {
                visible: false
            },
            tick: {
                visible: false
            },
            item: {
                offsetR: 0,
                rules: [{
                    rule: '%i == 9',
                    offsetX: 15
                }]
            },
            labels: ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
            ring: {
                size: 30,
                rules: [{
                        rule: '%v >= 50',
                        backgroundColor: '#E53935'
                    },
                    {
                        rule: '%v < 50',
                        backgroundColor: '#f7d708'
                    },
                    {
                        rule: '%v >= 0 && %v < 30',
                        backgroundColor: '#ff9e00'
                    }
                ]
            }
        },
        refresh: {
            type: "feed",
            transport: "js",
            url: "feed()",
            interval: 5000,
            resetTimeout: 1000
        },
        series: [{
            csize: "5%",
            values: [null], // starting value
            backgroundColor: 'black',
            indicator: [10, 10, 10, 10, .6],
            animation: {
                effect: 2,
                method: 5,
                sequence: 4,
                speed: 900
            },
        }],
        background: {
            visible: false
        }
    };

    zingchart.render({
        id: 'myChart',
        data: myConfig,
        height: 500,
        width: '100%'
    });



    //SEGUNDO GRAFICO

    const ctx = document.getElementById('myLineChart').getContext('2d');
    // Datos iniciales para el gráfico
    const data = {
        labels: [],
        datasets: [{
            label: 'ppm',
            data: [],
            backgroundColor: 'rgba(237, 19, 26, 1)',
            borderColor: 'rgba(237, 19, 26, 1)',
            borderWidth: 1
        }]
    };

    // Almacenar los datos originales
    const originalData = {
        labels: [],
        datasets: [{
            label: 'ppm',
            data: []
        }]
    };

    // Opciones de configuración para el gráfico
    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    // Crear y renderizar el gráfico
    const myLineChart = new Chart(ctx, config);

    // Función para agregar nuevos datos al gráfico
    function addData(randomValue) {
        // Obtener la fecha y hora actual
        const now = new Date();
        const timeString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        // Generar un dato aleatorio (puedes reemplazarlo con datos reales)
        //const newData = Math.floor(Math.random() * 100);

        // Agregar la nueva etiqueta y dato al gráfico
        originalData.labels.push(now);
        originalData.datasets[0].data.push(randomValue);

        // Limitar el número de puntos en el gráfico (por ejemplo, a los últimos 10)
        if (originalData.labels.length > 10) {
            originalData.labels.shift();
            originalData.datasets[0].data.shift();
        }

        // Actualizar los datos mostrados en el gráfico
        updateChart();
    }

    // Función para actualizar el gráfico con los datos filtrados
    function updateChart() {
        data.labels = originalData.labels.map(label => label.getHours() + ':' + label.getMinutes() + ':' + label.getSeconds());
        data.datasets[0].data = [...originalData.datasets[0].data];
        myLineChart.update();
    }

    // Obtener el botón y el modal por su ID

    function filterData() {
        const startDateInput = document.getElementById('startDate').value;
        const startTimeInput = document.getElementById('startTime').value;
        const endDateInput = document.getElementById('endDate').value;
        const endTimeInput = document.getElementById('endTime').value;

        const startDate = new Date(startDateInput + 'T' + startTimeInput);
        const endDate = new Date(endDateInput + 'T' + endTimeInput);
        const now = new Date();

        if (isNaN(startDate) || isNaN(endDate)) {
            alert('Por favor, introduce fechas válidas.');
            return;
        }

        if (endDate < startDate) {
            alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
            return;
        }
        if (startDate > currentDate || endDate > currentDate) {
            alert('Las fechas no pueden ser mayores a la fecha actual.');
            return;
        }

        const filteredLabels = [];
        const filteredData = [];

        for (let i = 0; i < originalData.labels.length; i++) {
            if (originalData.labels[i] >= startDate && originalData.labels[i] <= endDate) {
                filteredLabels.push(originalData.labels[i].getHours() + ':' + originalData.labels[i].getMinutes() + ':' + originalData.labels[i].getSeconds());
                filteredData.push(originalData.datasets[0].data[i]);
            }
        }

        data.labels = filteredLabels;
        data.datasets[0].data = filteredData;
        myLineChart.update();
    }


    //CERRAR Y ABRIR EL MODAL
    const openModalBtn = document.getElementById('openModalBtn');
    const modal2 = document.getElementById('myModal2');

    // Agregar un event listener al botón
    openModalBtn.addEventListener('click', function() {
        // Mostrar el modal cambiando el estilo de display a 'block'
        modal2.style.display = 'block';
        renderModalChart();
    });

    // Event listener para cerrar el modal cuando se haga clic fuera de él o en el botón de cerrar
    document.addEventListener('click', function(event) {
        if (event.target === modal2) {
            // Si se hace clic fuera del modal, cerrarlo
            modal2.style.display = 'none';
        }
    });

    // Para cerrar el modal cuando se hace clic en el botón de cerrar
    const closeModalBtn = document.getElementById('closeModalBtnn');
    closeModalBtn.addEventListener('click', function() {
        modal2.style.display = 'none';
    });

    // Filtrar datos al hacer clic en el botón de filtrar
    const filterBtn = document.getElementById('filterBtn');
    filterBtn.addEventListener('click', function() {
        filterData();
    });

    // Renderizar la gráfica en el modal
    function renderModalChart() {
        const modalCtx = document.getElementById('modalChart').getContext('2d');
        const modalChartConfig = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'ppm',
                    data: data.datasets[0].data,
                    backgroundColor: 'rgba(237, 19, 26, 1)',
                    borderColor: 'rgba(237, 19, 26, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
        new Chart(modalCtx, modalChartConfig);
    }


};
//CHART DEL MODAL
*/
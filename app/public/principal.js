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

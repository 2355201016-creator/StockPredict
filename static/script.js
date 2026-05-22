// =========================
// static/script.js
// =========================

let chartInstance = null;

async function predict() {

    try {

        const symbol =
            document.getElementById('symbol').value;

        const start =
            document.getElementById('start').value;

        const end =
            document.getElementById('end').value;

        if (!start || !end) {

            alert("Isi tanggal terlebih dahulu!");

            return;
        }

        const response =
            await fetch('/predict', {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    symbol,
                    start,
                    end
                })

            });

        const result =
            await response.json();

        console.log(result);

        if(result.error){

            alert(result.error);

            return;
        }

        // =========================
        // INFO CARD
        // =========================
        document.getElementById('lastPrice')
            .innerHTML =
            `Rp ${Number(result.last_price)
                .toLocaleString('id-ID')}`;

        document.getElementById('trend')
            .innerHTML =
            result.trend;

        document.getElementById('recommendation')
            .innerHTML =
            result.recommendation;

        document.getElementById('confidence')
            .innerHTML =
            result.confidence + '%';

        // =========================
        // TABLE
        // =========================
        const tableBody =
            document.getElementById(
                'predictionTableBody'
            );

        tableBody.innerHTML = '';

        result.table_data.forEach(item => {

            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${item.date}
                    </td>

                    <td class="actual-price">
                        Rp ${Number(item.actual)
                            .toLocaleString('id-ID')}
                    </td>

                    <td class="predicted-price">
                        Rp ${Number(item.predicted)
                            .toLocaleString('id-ID')}
                    </td>

                </tr>

            `;

        });

        // =========================
        // DESTROY CHART
        // =========================
        if(chartInstance){

            chartInstance.destroy();
        }

        // =========================
        // CHART
        // =========================
        const ctx =
            document.getElementById('chart');

        chartInstance =
            new Chart(ctx, {

                type: 'line',

                data: {

                    labels: result.labels,

                    datasets: [

                        {
                            label: 'Harga Aktual',

                            data: result.actual,

                            borderColor: '#3b82f6',

                            backgroundColor:
                                'rgba(59,130,246,0.15)',

                            borderWidth: 3,

                            tension: 0.4,

                            fill: true,

                            pointRadius: 4,

                            pointHoverRadius: 6
                        },

                        {
                            label: 'Prediksi AI',

                            data: result.predictions,

                            borderColor: '#a855f7',

                            backgroundColor:
                                'rgba(168,85,247,0.15)',

                            borderWidth: 3,

                            tension: 0.4,

                            fill: true,

                            pointRadius: 4,

                            pointHoverRadius: 6
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: 'index',

                        intersect: false
                    },

                    plugins: {

                        legend: {

                            labels: {
                                color: 'white',
                                font: {
                                    size: 14
                                }
                            }

                        }

                    },

                    scales: {

                        x: {

                            ticks: {

                                color: 'white',

                                maxRotation: 45,

                                minRotation: 45
                            },

                            grid: {

                                color:
                                'rgba(255,255,255,0.05)'
                            }

                        },

                        y: {

                            ticks: {

                                color: 'white'
                            },

                            grid: {

                                color:
                                'rgba(255,255,255,0.05)'
                            }

                        }

                    }

                }

            });

    } catch (error) {

        console.log(error);

        alert("Terjadi error!");

    }

}
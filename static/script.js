let chartInstance = null;

async function predict() {

    const symbol = document.getElementById('symbol').value;

    const start = document.getElementById('start').value;

    if (!start) {

        alert("Isi tanggal mulai!");
        return;
    }

    document.getElementById('trend').innerText = "Loading...";

    try {

        const response = await fetch('/predict', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                symbol,
                start
            })

        });

        const data = await response.json();

        console.log(data);

        if (data.error) {

            alert(data.error);
            return;
        }

        // tampilkan data
        document.getElementById('lastPrice').innerText =
    "Rp " +
    Number(data.last_price)
    .toLocaleString('id-ID', {
        minimumFractionDigits: 2
    });

        document.getElementById('trend').innerText =
            data.trend;

        document.getElementById('recommendation').innerText =
            data.recommendation;

        document.getElementById('confidence').innerText =
            data.confidence + "%";

        // chart
        const ctx = document
            .getElementById('chart')
            .getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {

            type: 'line',

            data: {

                labels: data.dates,

                datasets: [

                    {
                        label: 'Harga Historis',

                        data: data.prices,

                        borderColor: '#2563eb',

                        backgroundColor: 'rgba(37,99,235,0.2)',

                        borderWidth: 3,

                        fill: true,

                        tension: 0.4
                    },

                    {
                        label: 'Prediksi AI',

                        data: [

                            ...Array(data.prices.length - 1).fill(null),

                            data.prices[data.prices.length - 1],

                            ...data.predictions

                        ],

                        borderColor: '#ef4444',

                        borderDash: [6,6],

                        borderWidth: 3,

                        tension: 0.4
                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    x: {

                        ticks: {
                            maxTicksLimit: 10
                        }

                    }

                }

            }

        });

    } catch (err) {

        console.log(err);

        alert("Server Error!");
    }

}
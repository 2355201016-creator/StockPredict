from flask import Flask, render_template, request, jsonify
from model import get_stock_data, train_model, predict_future
from datetime import timedelta

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():

    try:

        data = request.json

        symbol = data['symbol']
        start = data['start']

        # otomatis hari ini
        from datetime import datetime

        end = datetime.today().strftime('%Y-%m-%d')

        # ambil data saham
        stock_data = get_stock_data(symbol, start, end)

        if stock_data is None or len(stock_data) < 20:

            return jsonify({
                'error': 'Data saham tidak ditemukan'
            })

        # training model
        model, processed_data = train_model(stock_data)

        # prediksi
        predictions = predict_future(model, processed_data)

        # harga terakhir
        last_real = float(processed_data['Close'].iloc[-1])

        # prediksi terakhir
        last_pred = predictions[-1]

        # trend
        trend = "📈 NAIK"

        if last_pred < last_real:
            trend = "📉 TURUN"

        # persentase perubahan
        change_percent = (
            (last_pred - last_real)
            / last_real
        ) * 100

        # rekomendasi
        recommendation = "🟢 BUY"

        if change_percent < 0:
            recommendation = "🔴 SELL"

        # confidence AI
        confidence = round(abs(change_percent) * 10, 2)

        if confidence > 99:
            confidence = 99

        # tanggal prediksi
        future_labels = []

        last_date = processed_data.index[-1]

        for i in range(1, 6):

            next_date = last_date + timedelta(days=i)

            future_labels.append(
                next_date.strftime('%Y-%m-%d')
            )

        # tanggal historis
        historical_dates = []

        for date in processed_data.index:

            historical_dates.append(
                date.strftime('%Y-%m-%d')
            )

        # gabung tanggal
        all_dates = historical_dates + future_labels

        return jsonify({

            'dates': all_dates,

            'prices':
                processed_data['Close'].tolist(),

            'predictions':
                predictions,

            'trend':
                trend,

            'last_price':
                round(last_real, 2),

            'change_percent':
                round(change_percent, 2),

            'recommendation':
                recommendation,

            'confidence':
                confidence

        })

    except Exception as e:

        return jsonify({
            'error': str(e)
        })


if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000)
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor


# =========================
# AMBIL DATA SAHAM
# =========================
def get_stock_data(symbol, start, end):

    data = yf.download(symbol, start=start, end=end)

    if data.empty:
        return None

    data = data[['Close']]

    data.columns = ['Close']

    data = data.dropna()

    return data


# =========================
# TRAINING MODEL AI
# =========================
def train_model(data):

    # Moving Average
    data['MA5'] = data['Close'].rolling(5).mean()

    data['MA10'] = data['Close'].rolling(10).mean()

    data = data.dropna()

    # fitur
    X = data[['Close', 'MA5', 'MA10']]

    # target
    y = data['Close'].shift(-1)

    X = X[:-1]
    y = y[:-1]

    # model machine learning
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    # training
    model.fit(X, y)

    return model, data


# =========================
# PREDIKSI MASA DEPAN
# =========================
def predict_future(model, data, days=5):

    predictions = []

    last_close = float(data['Close'].iloc[-1])

    last_ma5 = float(data['MA5'].iloc[-1])

    last_ma10 = float(data['MA10'].iloc[-1])

    current_input = [[
        last_close,
        last_ma5,
        last_ma10
    ]]

    for _ in range(days):

        pred = model.predict(current_input)[0]

        predictions.append(float(pred))

        current_input = [[
            float(pred),
            float(pred),
            float(pred)
        ]]

    return predictions
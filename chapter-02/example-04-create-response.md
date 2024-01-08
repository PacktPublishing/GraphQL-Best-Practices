type Weather {
    city: String!
    date: String!
    temperature: Float!
    wind: Wind!
    rain: Rain!
    humidity: Float!
}

type Wind {
    speed: Float!
    direction: String!
}

type Rain {
    volume: Float!
    chance: Float!
}

type Query {
    getWeatherByCityAndDate(city: String!, date: String!): Weather
}
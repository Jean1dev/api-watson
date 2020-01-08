require('dotenv').config({silent: true})
const app = require('./src/app')
const port = process.env.PORT || 8082

app.listen(port, () => console.log('api-assitant ', port))
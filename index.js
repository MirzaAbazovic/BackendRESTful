var express    = require('express');       
var app        = express();                 
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        

var router = express.Router();   

router.get('/ping', function(req, res) {
    console.log(req);
    res.json({ message: 'Pong on :'+Date().toLocaleString() });   
});

app.use('/api', router);


app.listen(port);
console.log('Server is up and listening on ' + port);
const  {XRayProducer} = require('./xray');

prod = new XRayProducer("test", {"test0":"", "test1":""} );
console.log(prod);
prod.send({"test1":"abc"});



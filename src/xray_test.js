const  {XRayProducer,XRayConsumer} = require('./xray');

cons = new XRayConsumer("localhost");

prod = new XRayProducer("test", {"test0":"", "test1":""} );
console.log(prod);
prod = new XRayProducer("foo", {"foo":"", "bar":""} );

cons2 = new XRayConsumer("localhost");

console.log(prod);


function again() { 
    prod.send({"test1":"abc"});
    setTimeout(again, 1000);
}    

again();


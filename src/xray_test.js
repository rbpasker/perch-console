const  {XRayProducer,XRayConsumer} = require('./xray');

// two producers
prod1 = new XRayProducer("test", {"test0":"", "test1":""} );
prod2 = new XRayProducer("foo", {"foo":"", "bar":""} );

// one consumer
cons2 = new XRayConsumer("localhost");

// 
function again(prod) { 
    console.log(`test: sending to ${prod.id}`);
    prod.send({"key":`message for ${prod.id}`});
    setTimeout(again, 1000, prod);
}    

again(prod1);
again(prod2);


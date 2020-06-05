var esl = require('modesl'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || 3500,
    server = app.listen(port,()=> {
        console.log('Magic happens at port: '+ port);        
    });

var esl_server = new esl.Server({port: 8085, myevents:true}, function(){
    console.log("esl server is up");
});

app.get('/check/:id',(req,res)=> {
    (calls[req.params.id]).status();
});

let calls = {};

class CallProcessor {
    constructor(conn) {
        start_time = new Date().getTime();

        this.executeWs = (uri, headers) => {
            conn.execute('set',"P-wsbridge-websocket-uri=ws://54.144.82.36:3000");
            conn.execute('set',"P-wsbridge-websocket-content-type=audio%2Fl16%3Brate%3D16000");
            conn.execute('set','P-wsbridge-websocket-headers={"text":"hello there. hows it going?"}');
            conn.execute('bridge','wsbridge');
        }

        this.status = () => {
            conn.api('status', function(res) {
                //log result body and exit
                console.log(res.getBody());
                process.exit(0);
            });
        };

        this.terminate = () => {
            conn.execute('hangup',(res)=> {
                this.call_end = new Date().getTime();
                var delta = (this.call_end - this.call_start) / 1000;
                console.log("Call duration " + delta + " seconds");
            });
        };
    }   
}
esl_server.on('connection::ready', function(conn, id) {
    // console.log('new call ' + id);
    // conn.call_start = new Date().getTime();
    console.log(`ESL Server ID = ${id}\n`);
    
    calls[id] = new CallProcessor(conn);
    calls[id].executeWs(x,y);

    // conn.on('esl::end', function(evt, body) {
    //     this.call_end = new Date().getTime();
    //     var delta = (this.call_end - this.call_start) / 1000;
    //     console.log("Call duration " + delta + " seconds");
    // });
});

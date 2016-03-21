

$(document).ready(function() {
    var table = $('#log-table').DataTable();
    var socket = io('http://localhost:8080');
    socket.on('event', function(data) {
        console.log(data);
        table.row.add([
            data.datetime,
            data.entity,
            data.action,
            JSON.stringify(data.data,null, 2)            
        ]).draw(false);       
    });
});




$(document).ready(function() {
    var table = $('#log-table').DataTable();
    var socket = io('https://mirza-node.herokuapp.com');
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


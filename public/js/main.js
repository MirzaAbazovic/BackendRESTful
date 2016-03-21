 var socket = io('http://localhost:8080');
  socket.on('connect', function(){
    console.log("Connected");  
    });
  socket.on('event', function(data){
      console.log(data);
      var tableRef = document.getElementById('log-table').getElementsByTagName('tbody')[0];
      var newRow   = tableRef.insertRow(tableRef.rows.length);
      var entityCell  = newRow.insertCell(0);
      var entityText  = document.createTextNode(data.entity);
      var actionCell  = newRow.insertCell(1);
      var actionText  = document.createTextNode(data.action);
      var dataCell  = newRow.insertCell(2);
      var dataText  = document.createTextNode(JSON.stringify(data.data));
      entityCell.appendChild(entityText);
      actionCell.appendChild(actionText);
      dataCell.appendChild(dataText);      
  });
  socket.on('disconnect', function(){
      console.log("Disconnected");
  });
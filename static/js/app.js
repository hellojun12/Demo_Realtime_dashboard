$(document).ready(function () {
  const ctx = document.getElementById("lineChart").getContext("2d");
  const ctx2 = document.getElementById("anomalyChart").getContext("2d");

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        { 
          label: "P-MIN", 
          fill: false
       },
       {
          label: "Predict",
          bordercolor:"rgba(255, 0, 0, 1)",
          backgroundColor: "rgba(255,0,0,1",
          borderDash: [5, 5],
          fill: false
       }
      ],
    },
    options: {
      borderWidth: 3,
      maintainAspectRatio:false

    },
  });

  const myChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      datasets: [
        { 
          label: "threshold", 
          fill: false,
          bordercolor: 'rgba(255, 0, 0, 1)',
          backgroundColor: 'rgba(255, 0, 0, 1)'

       },
       {
          label: "distance",
          fill: false,
          bordercolor: 'rgba(0, 0, 0, 1)',
          backgroundColor: 'rgba(0, 0, 0, 1)'
       }
      ],
    },

    options: {

      plugins: {
        colors: {
          forceOverride: true
        }
      },
      borderWidth: 3,
      maintainAspectRatio: false

    },
  });

  function addData(label, pmin, pmin_pred) {
    myChart.data.labels.push(label);
    myChart2.data.labels.push(label);

    var l_data = NaN;
    myChart.data.datasets.forEach((dataset) => {
      
      if (dataset.label == "P-MIN"){

        l_data = dataset.data[dataset.data.length-1]
        dataset.data.push(parseFloat(pmin));

      } else if (dataset.label == "Predict"){

        dataset.data.forEach((element, index) => {

          if (index < dataset.data.length-1){
            dataset.data[index] = NaN;
          } else {
            dataset.data[index] = l_data;
          }
          
        });

        dataset.data.push(parseFloat(pmin_pred));
      }
        
    });

    myChart2.data.datasets.forEach((dataset) => {

      if (dataset.label == "threshold"){
        dataset.data.push(0.1);
      } else if (dataset.label == "distance") {
        dataset.data.push(Math.abs(pmin - pmin_pred));
      }
    })
    
    myChart2.update();
    myChart.update();
    
  }


  function removeFirstData(myChart) {

    myChart.data.labels.shift();
    myChart.data.datasets.forEach((dataset) => {

      dataset.data.shift();

    });

  }

  const MAX_DATA_COUNT = 6;
  //connect to the socket server.
  //   var socket = io.connect("http://" + document.domain + ":" + location.port);
  var socket = io.connect();

  //receive details from server
  socket.on("updateSensorData", function (msg) {
    console.log(msg)
    // console.log("Received sensorData :: " + msg.date + " :: " + msg.value);
    console.log("Received sensorData |  Time :" + msg.time + " | P_min: " + msg.pmin + " | P_min_pred" + msg.pmin_pred);

    // Show only MAX_DATA_COUNT data
    if (myChart.data.labels.length > 12){
      removeFirstData(myChart);
    }

    if (myChart2.data.labels.length > 50){
      removeFirstData(myChart2);
    }
    addData(msg.time, msg.pmin, msg.pmin_pred);

  });
});
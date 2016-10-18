var availableOrders = [
  {
    code: 'order1',
    text: 'Xray Chest X-ray'
  }, 
  {
    code: 'order2',
    text: 'Radiology-CT Head'
  },
  {
    code: 'order3',
    text: 'Cardiac-ECG'
  },
  {
    code: 'order4',
    text: 'Physio-crutches'
  }
];

function terminology(messageObj, finished) {
  //  /api/terminology/list/order
  if (messageObj.params['0'] === 'list/order') {
    finished(availableOrders);
    return;
  }
  finished([]);
}

module.exports = terminology;
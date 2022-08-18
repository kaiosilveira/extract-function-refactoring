const Clock = { today: new Date() };

function printOwing(invoice) {
  printBanner();

  const outstanding = calculateOutstanding(invoice);
  recordDueDate(invoice);
  printDetails(invoice, outstanding);

  function recordDueDate(invoice) {
    const today = Clock.today;
    invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  }

  function printDetails(invoice, outstanding) {
    console.log(`name: ${invoice.customer}`);
    console.log(`amount: ${outstanding}`);
    console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
  }
}

function printBanner() {
  console.log('***********************');
  console.log('**** Customer owes ****');
  console.log('***********************');
}

function calculateOutstanding(invoice) {
  let outstanding = 0;

  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  return outstanding;
}

module.exports = { printOwing };

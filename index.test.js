const { printOwing } = require('.');

const noop = () => {};
describe('printOwing', () => {
  const invoice = { orders: [{ amount: 10 }, { amount: 10 }], customer: 'Kaio' };
  const spyOnConsoleLog = jest.spyOn(console, 'log').mockImplementation(noop);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should print a banner', () => {
    printOwing(invoice);
    expect(spyOnConsoleLog).toHaveBeenCalledWith('**** Customer owes ****');
  });

  it('should print the customer name', () => {
    printOwing(invoice);
    expect(spyOnConsoleLog).toHaveBeenCalledWith('name: Kaio');
  });

  it('should print the outstanding amount for an invoice', () => {
    printOwing(invoice);
    expect(spyOnConsoleLog).toHaveBeenCalledWith('amount: 20');
  });

  it('should print the due date as thirty days from now', () => {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

    printOwing(invoice);
    expect(spyOnConsoleLog).toHaveBeenCalledWith(`due: ${dueDate.toLocaleDateString()}`);
  });
});

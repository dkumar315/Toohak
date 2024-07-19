// Do not delete this file
type ErrorMsg = {
  error: string;
};

function echo(value: string): { value: string } | ErrorMsg {
  if (value === 'echo') {
    return { error: 'You cannot echo the word echo itself' };
  }
  return {
    value,
  };
}

export { echo };

function newEcho(value: string): { value: string } | ErrorMsg {
  if (value === 'echo') {
    throw new Error('You cannot echo the word echo itself');
  }
  return {
    value,
  };
}

export { newEcho };

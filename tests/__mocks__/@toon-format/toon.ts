const mockEncode = jest.fn((data: unknown) => {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data);
  }
  return String(data);
});

const mockDecode = jest.fn((str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
});

module.exports = {
  encode: mockEncode,
  decode: mockDecode,
  DEFAULT_DELIMITER: ',',
  DELIMITERS: [',', '|', '\t']
};

import { getPathParts } from './pathUtils';

describe('getPathParts', () => {
  it('should return the same array when path is already an array', () => {
    const path = ['Login', 'UI'];

    expect(getPathParts(path)).toEqual(['Login', 'UI']);
  });

  it('should split a string path on forward slash', () => {
    expect(getPathParts('Login/UI/Tests')).toEqual(['Login', 'UI', 'Tests']);
  });

  it('should split a string path on dollar sign', () => {
    expect(getPathParts('Login$UI$Tests')).toEqual(['Login', 'UI', 'Tests']);
  });

  it('should handle mixed slash and dollar separators in string path', () => {
    expect(getPathParts('Login/UI$Tests/More')).toEqual(['Login', 'UI', 'Tests', 'More']);
  });

  it('should ignore empty segments when string path contains consecutive separators', () => {
    expect(getPathParts('/Login//UI$$Tests/')).toEqual(['Login', 'UI', 'Tests']);
  });

  it('should return an empty array for an empty string', () => {
    expect(getPathParts('')).toEqual([]);
  });

  it('should return an empty array when path is undefined', () => {
    expect(getPathParts(undefined)).toEqual([]);
  });
});

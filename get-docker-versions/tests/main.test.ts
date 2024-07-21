import * as core from '@actions/core';

import * as functions from '../src/functions';
import * as main from '../src/main';

const runMock = jest.spyOn(main, 'main');

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;
let getDockerVersions: jest.SpiedFunction<typeof functions.getDockerVersions>;

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();

    getDockerVersions = jest
      .spyOn(functions, 'getDockerVersions')
      .mockImplementation()
      .mockReturnValue(
        Promise.resolve({
          allTags: ['tag1', 'tag2'],
          allVersions: ['1.0.0', '1.0.1'],
          latestVersion: '1.0.1',
        })
      );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should call getDockerVersions', async () => {
    getInputMock.mockImplementation((name) => name); // return the name we passed into the function

    await main.main();

    expect(runMock).toHaveReturned();

    expect(getInputMock).toHaveBeenCalledTimes(3);
    expect(getInputMock).toHaveBeenCalledWith('api-url');
    expect(getInputMock).toHaveBeenCalledWith('image-author');
    expect(getInputMock).toHaveBeenCalledWith('image-name');

    expect(getDockerVersions).toHaveBeenCalledTimes(1);
    expect(getDockerVersions).toHaveBeenCalledWith('api-url', 'image-author', 'image-name');

    expect(setOutputMock).toHaveBeenCalledTimes(3);
    expect(setOutputMock).toHaveBeenCalledWith('latest-version', '1.0.1');
    expect(setOutputMock).toHaveBeenCalledWith('all-versions', ['1.0.0', '1.0.1']);
    expect(setOutputMock).toHaveBeenCalledWith('all-tags', ['tag1', 'tag2']);
  });

  it('should call setFailed if an error is thrown', async () => {
    getInputMock.mockImplementation((name) => {
      throw new Error('error');
    });

    await main.main();

    expect(runMock).toHaveReturned();

    expect(setFailedMock).toHaveBeenCalledTimes(1);
    expect(setFailedMock).toHaveBeenCalledWith('error');
  });
});

import { Tag } from 'get-docker-versions/src/types';

import * as functions from '../src/functions';

let fetchMock: jest.SpiedFunction<typeof global.fetch>;

const setFetchMock = (firstCallResult: any, secondCallResult: any) => {
  fetchMock = jest
    .spyOn(global, 'fetch')
    .mockReturnValueOnce(Promise.resolve({ json: () => Promise.resolve(firstCallResult) } as unknown as Response))
    .mockReturnValueOnce(Promise.resolve({ json: () => Promise.resolve(secondCallResult) } as unknown as Response));
};

describe('functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkIfSemver', () => {
    it('should return true for a semver tag', () => {
      expect(functions.checkIfSemver('1.0.0')).toBe(true);
    });

    it('should return false for a non-semver tag', () => {
      expect(functions.checkIfSemver('latest')).toBe(false);
    });
  });

  describe('getAllTags', () => {
    it('should call fetch multiple times and return all tags', async () => {
      // Arrange
      const url = 'api-url';
      const firstCall = {
        results: [{ name: 'latest', digest: 'sha256:123' }],
        next: 'api-url?page=2',
      };
      const secondCall = {
        results: [{ name: '1.0.0', digest: 'sha256:456' }],
      };
      setFetchMock(firstCall, secondCall);

      // Act
      const result = await functions.getAllTags(url);

      // Assert
      expect(result).toEqual([
        { name: 'latest', digest: 'sha256:123' },
        { name: '1.0.0', digest: 'sha256:456' },
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith(url);
      expect(fetchMock).toHaveBeenCalledWith(firstCall.next);
    });

    it('should call fetch once and return all tags', async () => {
      // Arrange
      const url = 'api-url';
      const firstCall = {
        results: [{ name: 'latest', digest: 'sha256:123' }],
      };
      setFetchMock(firstCall, undefined);

      // Act
      const result = await functions.getAllTags(url);

      // Assert
      expect(result).toEqual([{ name: 'latest', digest: 'sha256:123' }]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(url);
    });
  });

  describe('getDockerVersions', () => {
    it('should return correct data', async () => {
      // Arrange
      const apiUrl = 'api-url';
      const imageAuthor = 'image-author';
      const imageName = 'image-name';
      const tags = [
        { name: 'latest', digest: 'sha256:123' },
        { name: '1.0.1', digest: 'sha256:123' },
        { name: '1.0.0', digest: 'sha256:456' },
      ];
      const getAllTagsMock = jest
        .spyOn(functions, 'getAllTags')
        .mockReturnValue(Promise.resolve(tags) as unknown as Promise<Tag[]>);

      // Act
      const result = await functions.getDockerVersions(apiUrl, imageAuthor, imageName);
      console.log(result);

      // Assert
      expect(result).toEqual({
        latestVersion: '1.0.1',
        allVersions: ['1.0.1', '1.0.0'],
        allTags: ['latest', '1.0.1', '1.0.0'],
      });

      expect(getAllTagsMock).toHaveBeenCalledTimes(1);
      expect(getAllTagsMock).toHaveBeenCalledWith(`${apiUrl}/${imageAuthor}/${imageName}/tags`);
    });

    it('should return correct data when the latest tag is not found', async () => {
      // Arrange
      const apiUrl = 'api-url';
      const imageAuthor = 'image-author';
      const imageName = 'image-name';
      const tags = [
        { name: '1.0.1', digest: 'sha256:123' },
        { name: '1.0.0', digest: 'sha256:456' },
      ];
      const getAllTagsMock = jest
        .spyOn(functions, 'getAllTags')
        .mockReturnValue(Promise.resolve(tags) as unknown as Promise<Tag[]>);

      // Act
      const result = await functions.getDockerVersions(apiUrl, imageAuthor, imageName);

      // Assert
      expect(result).toEqual({
        latestVersion: '1.0.1',
        allVersions: ['1.0.1', '1.0.0'],
        allTags: ['1.0.1', '1.0.0'],
      });

      expect(getAllTagsMock).toHaveBeenCalledTimes(1);
      expect(getAllTagsMock).toHaveBeenCalledWith(`${apiUrl}/${imageAuthor}/${imageName}/tags`);
    });
  });
});

import * as core from '@actions/core';

import { getDockerVersions } from './functions';

export const main = async () => {
  try {
    const apiUrl = core.getInput('api-url');
    const imageAuthor = core.getInput('image-author');
    const imageName = core.getInput('image-name');

    core.debug(`apiUrl: ${apiUrl}`);
    core.debug(`imageAuthor: ${imageAuthor}`);
    core.debug(`imageName: ${imageName}`);

    const result = await getDockerVersions(apiUrl, imageAuthor, imageName);

    core.debug(
      `latestVersion: ${result.latestVersion}, allVersions: ${result.allVersions}, allTags: ${result.allTags}`
    );

    core.setOutput('latest-version', result.latestVersion);
    core.setOutput('all-versions', result.allVersions);
    core.setOutput('all-tags', result.allTags);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
};
